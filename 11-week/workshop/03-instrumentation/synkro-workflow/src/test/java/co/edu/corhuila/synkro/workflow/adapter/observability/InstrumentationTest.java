package co.edu.corhuila.synkro.workflow.adapter.observability;

import com.fasterxml.jackson.databind.*;
import jakarta.servlet.ServletException;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.*;
import static org.junit.jupiter.api.Assertions.*;

class InstrumentationTest {
    private static final String TRACE = "4bf92f3577b34da6a3ce929d0e0e4736";
    private static final String PARENT = "00f067aa0ba902b7";
    private static final String CORRELATION = "4f1c2b7e-8a3d-4e21-9b6f-0c5d7a2e1f90";
    private final ByteArrayOutputStream output = new ByteArrayOutputStream();
    private final ObjectMapper json = new ObjectMapper();
    private final JsonRequestLogger logger = new JsonRequestLogger(
        new PrintStream(output, true, StandardCharsets.UTF_8), "0.1.0-workshop", "qa");
    private final TraceContextFilter filter = new TraceContextFilter(logger);

    @Test void continuesIncomingTraceWithANewServerSpanAndReturnsContext() throws Exception {
        var request = new MockHttpServletRequest("GET", "/health");
        request.addHeader("traceparent", "00-" + TRACE + "-" + PARENT + "-00");
        request.addHeader("X-Correlation-Id", CORRELATION);
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> {
            var context = (TraceContext) req.getAttribute(TraceContextFilter.CONTEXT);
            assertEquals(TRACE, context.traceId());
            assertEquals(PARENT, context.parentSpanId());
            assertNotEquals(PARENT, context.spanId());
            assertTrue(context.spanId().matches("[0-9a-f]{16}"));
        });
        assertTrue(response.getHeader("traceparent").startsWith("00-" + TRACE + "-"));
        assertTrue(response.getHeader("traceparent").endsWith("-00"));
        assertEquals(CORRELATION, response.getHeader("X-Correlation-Id"));
        var log = json.readTree(output.toString(StandardCharsets.UTF_8));
        for (String field : List.of("timestamp", "level", "service", "version", "environment",
                "trace_id", "span_id", "correlation_id", "event", "message", "duration_ms"))
            assertTrue(log.hasNonNull(field), field);
        assertEquals(TRACE, log.path("trace_id").asText());
        assertEquals(response.getHeader("traceparent").split("-")[2], log.path("span_id").asText());
        assertEquals(CORRELATION, log.path("correlationId").asText());
        assertEquals("synkro-workflow", log.path("service").asText());
        assertEquals("0.1.0-workshop", log.path("version").asText());
        assertEquals("qa", log.path("environment").asText());
        assertTrue(log.path("timestamp").asText().matches(".*\\.\\d{3}Z"));
        assertTrue(log.path("duration_ms").asDouble() >= 0);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "invalid", "00-00000000000000000000000000000000-00f067aa0ba902b7-01",
        "00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01",
        "ff-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
        "00-4BF92F3577B34DA6A3CE929D0E0E4736-00f067aa0ba902b7-01"})
    void startsFreshForMissingOrInvalidContext(String incoming) throws Exception {
        var request = new MockHttpServletRequest("GET", "/health");
        if (!incoming.isEmpty()) request.addHeader("traceparent", incoming);
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> {});
        assertTrue(response.getHeader("traceparent").matches("00-[0-9a-f]{32}-[0-9a-f]{16}-01"));
        assertNotEquals(TRACE, response.getHeader("traceparent").split("-")[1]);
        UUID.fromString(response.getHeader("X-Correlation-Id"));
    }

    @Test void rejectsAmbiguousHeadersAndUntrustedCorrelationText() throws Exception {
        var request = new MockHttpServletRequest("GET", "/health");
        request.addHeader("traceparent", "00-" + TRACE + "-" + PARENT + "-01");
        request.addHeader("traceparent", "00-" + TRACE + "-" + PARENT + "-01");
        request.addHeader("X-Correlation-Id", "customer@example.com");
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> {});
        assertNotEquals(TRACE, response.getHeader("traceparent").split("-")[1]);
        UUID.fromString(response.getHeader("X-Correlation-Id"));
        assertFalse(output.toString(StandardCharsets.UTF_8).contains("customer@example.com"));
    }

    @Test void onlyAllowsTypedDomainFieldsAndCannotOverrideTraceIdentity() throws Exception {
        var context = TraceContext.fromHeaders(null, CORRELATION);
        logger.write(context, "INFO", "saga.started", "Sale registration started", 0,
            Map.of("saga_id", CORRELATION, "email", "secret@example.com",
                "token", "secret-token", "trace_id", "forged", "quantity", "secret-value"));
        String raw = output.toString(StandardCharsets.UTF_8);
        var log = json.readTree(raw);
        assertEquals(CORRELATION, log.path("saga_id").asText());
        assertEquals(context.traceId(), log.path("trace_id").asText());
        assertFalse(log.has("email"));
        assertFalse(log.has("token"));
        assertFalse(log.has("quantity"));
        assertFalse(raw.contains("secret"));
    }

    @Test void logsSafeErrorAndPreservesTheOriginalException() throws Exception {
        var error = new ServletException("secret-token");
        var request = new MockHttpServletRequest("GET", "/health");
        var response = new MockHttpServletResponse();
        assertSame(error, assertThrows(ServletException.class,
            () -> filter.doFilter(request, response, (req, res) -> { throw error; })));
        var log = json.readTree(output.toString(StandardCharsets.UTF_8));
        assertEquals("ERROR", log.path("level").asText());
        assertEquals("technical_failure", log.path("outcome").asText());
        assertFalse(output.toString(StandardCharsets.UTF_8).contains("secret-token"));
        assertFalse(log.has("http_status"));
    }

    @Test void concurrentRequestsKeepSeparateTraceContexts() throws Exception {
        try (var pool = Executors.newFixedThreadPool(4)) {
            var results = new ArrayList<Future<String>>();
            for (int i = 0; i < 12; i++) results.add(pool.submit(() -> {
                var response = new MockHttpServletResponse();
                filter.doFilter(new MockHttpServletRequest("GET", "/health"), response, (req, res) -> {});
                return response.getHeader("traceparent").split("-")[1];
            }));
            var ids = new HashSet<String>();
            for (var result : results) ids.add(result.get());
            assertEquals(12, ids.size());
            assertEquals(12, output.toString(StandardCharsets.UTF_8).lines().count());
        }
    }

    @Test void omitsUnknownOptionalValuesAndSuppressesProductionDebug() {
        var context = TraceContext.fromHeaders(null, CORRELATION);
        var fields = new HashMap<String, Object>();
        fields.put("step", null);
        assertDoesNotThrow(() -> logger.write(context, "INFO", "saga.started",
            "Sale registration started", 0, fields));
        var productionOutput = new ByteArrayOutputStream();
        var productionLogger = new JsonRequestLogger(new PrintStream(productionOutput), "0.1.0-workshop", "prod");
        productionLogger.write(context, "DEBUG", "stock.reservation.requested",
            "Requesting stock reservation", 0, Map.of());
        assertEquals(0, productionOutput.size());
    }}
