package co.edu.corhuila.synkro.workflow.adapter.participants;

import co.edu.corhuila.synkro.workflow.adapter.http.ReservationProbeController;
import co.edu.corhuila.synkro.workflow.adapter.observability.*;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DownstreamPropagationTest {
    private static final String TRACE = "4bf92f3577b34da6a3ce929d0e0e4736";
    private static final String CORRELATION = "4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90";
    private static final String SAGA = "15920dc9-bd55-41a0-8e41-5832377383e5";
    private static final String BODY = "{\"lines\":[{\"productId\":\"550e8400-e29b-41d4-a716-446655440000\",\"quantity\":2}]}";
    private HttpServer products;
    private final AtomicReference<String> incomingTrace = new AtomicReference<>();
    private final AtomicReference<String> incomingCorrelation = new AtomicReference<>();
    private final AtomicReference<String> incomingKey = new AtomicReference<>();
    private final AtomicReference<String> incomingToken = new AtomicReference<>();
    private final AtomicReference<String> incomingBody = new AtomicReference<>();
    private final AtomicReference<String> incomingMethod = new AtomicReference<>();
    private final RequestMetrics metrics = new RequestMetrics();
    private final ByteArrayOutputStream logs = new ByteArrayOutputStream();

    @BeforeEach void startProducts() throws IOException {
        products = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    }
    @AfterEach void stopProducts() { products.stop(0); }

    private MockMvc workflow(int responseStatus, long delayMs, Duration timeout) {
        products.createContext("/api/v1/stock-reservations", exchange -> {
            incomingTrace.set(exchange.getRequestHeaders().getFirst("traceparent"));
            incomingCorrelation.set(exchange.getRequestHeaders().getFirst("X-Correlation-Id"));
            incomingKey.set(exchange.getRequestHeaders().getFirst("Idempotency-Key"));
            incomingToken.set(exchange.getRequestHeaders().getFirst("Authorization"));
            incomingMethod.set(exchange.getRequestMethod());
            incomingBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            try {
                Thread.sleep(delayMs);
                byte[] body = (responseStatus == 201 ? "{\"status\":\"RESERVED\"}"
                    : "{\"error\":\"BUSINESS_RULE_VIOLATION\"}").getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(responseStatus, body.length);
                exchange.getResponseBody().write(body);
            } catch (InterruptedException failure) { Thread.currentThread().interrupt(); }
            finally { exchange.close(); }
        });
        products.start();
        var logger = new JsonRequestLogger(new PrintStream(logs), "0.1.0-workshop", "qa");
        var client = new ProductsClient(URI.create("http://127.0.0.1:" + products.getAddress().getPort()),
            "test-only-token", timeout, logger);
        return MockMvcBuilders.standaloneSetup(new ReservationProbeController(client))
            .addFilters(new TraceContextFilter(logger, metrics)).build();
    }

    @Test void receivedTraceIdEqualsTraceIdSentToProductsOverRealHttp() throws Exception {
        var mvc = workflow(201, 0, Duration.ofSeconds(3));
        var result = mvc.perform(post("/workshop/stock-reservations/" + SAGA)
            .header("traceparent", "00-" + TRACE + "-00f067aa0ba902b7-00")
            .header("X-Correlation-Id", CORRELATION).contentType("application/json").content(BODY))
            .andExpect(status().isCreated()).andReturn();
        String[] outgoing = incomingTrace.get().split("-");
        assertEquals(TRACE, outgoing[1]);
        assertEquals("00", outgoing[3]);
        assertNotEquals(result.getResponse().getHeader("traceparent").split("-")[2], outgoing[2]);
        assertEquals(CORRELATION, incomingCorrelation.get());
        assertEquals(SAGA + ":reserve-stock", incomingKey.get());
        assertEquals("Bearer test-only-token", incomingToken.get());
        assertEquals("POST", incomingMethod.get());
        assertEquals(2, new com.fasterxml.jackson.databind.ObjectMapper()
            .readTree(incomingBody.get()).path("lines").get(0).path("quantity").asInt());
        assertTrue(logs.toString(StandardCharsets.UTF_8).contains(outgoing[2]));
        assertFalse(logs.toString(StandardCharsets.UTF_8).contains("test-only-token"));
        assertTrue(metrics.scrape().contains("outcome=\"success\"} 1"));
    }

    @Test void downstreamBusinessRejectionIsCountedWithoutRetry() throws Exception {
        workflow(422, 0, Duration.ofSeconds(3)).perform(post("/workshop/stock-reservations/" + SAGA)
            .contentType("application/json").content(BODY)).andExpect(status().isUnprocessableEntity());
        assertTrue(metrics.scrape().contains("outcome=\"business_rejected\"} 1"));
    }

    @Test void timeoutIsSafeAndCountedAsTechnicalFailure() throws Exception {
        workflow(201, 400, Duration.ofMillis(100)).perform(post("/workshop/stock-reservations/" + SAGA)
            .contentType("application/json").content(BODY)).andExpect(status().isInternalServerError());
        assertTrue(metrics.scrape().contains("outcome=\"technical_failure\"} 1"));
        assertTrue(logs.toString(StandardCharsets.UTF_8).contains("stock.reservation.timeout"));
        assertFalse(logs.toString(StandardCharsets.UTF_8).contains("test-only-token"));
    }

    @Test void invalidReservationNeverReachesProducts() throws Exception {
        workflow(201, 0, Duration.ofSeconds(3)).perform(post("/workshop/stock-reservations/" + SAGA)
            .contentType("application/json").content("{\"lines\":[]}")).andExpect(status().isBadRequest());
        assertNull(incomingTrace.get());
    }
}