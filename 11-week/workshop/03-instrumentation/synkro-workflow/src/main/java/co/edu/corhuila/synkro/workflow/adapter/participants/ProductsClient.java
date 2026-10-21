package co.edu.corhuila.synkro.workflow.adapter.participants;

import co.edu.corhuila.synkro.workflow.adapter.observability.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

public final class ProductsClient implements AutoCloseable {
    public record Line(UUID productId, int quantity) {}
    public record ReservationRequest(List<Line> lines) {}
    public record Result(int status, String body) {}
    private final URI endpoint;
    private final String serviceToken;
    private final Duration timeout;
    private final JsonRequestLogger logger;
    private final HttpClient http;
    private final ObjectMapper json = new ObjectMapper();

    public ProductsClient(URI base, String serviceToken, Duration timeout, JsonRequestLogger logger) {
        this.endpoint = base.resolve("/api/v1/stock-reservations");
        this.serviceToken = serviceToken;
        this.timeout = timeout;
        this.logger = logger;
        this.http = HttpClient.newBuilder().connectTimeout(timeout).followRedirects(HttpClient.Redirect.NEVER).build();
    }

    public Result reserve(UUID sagaId, ReservationRequest body, TraceContext parent) {
        var context = parent.clientSpan();
        long started = System.nanoTime();
        var fields = new HashMap<String, Object>(Map.of("saga_id", sagaId.toString(),
            "step", "reserve-stock", "downstream_service", "synkro-products-api", "attempt", 1));
        if (serviceToken.isBlank()) {
            logger.write(context, "ERROR", "stock.reservation.failed", "Workflow service credential is not configured",
                0, fields);
            return failure(context);
        }
        try {
            var request = HttpRequest.newBuilder(endpoint).timeout(timeout)
                .header("Content-Type", "application/json")
                .header("traceparent", context.traceparent())
                .header("X-Correlation-Id", context.correlationId())
                .header("Authorization", "Bearer " + serviceToken)
                .header("Idempotency-Key", sagaId + ":reserve-stock")
                .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build();
            var response = http.send(request, HttpResponse.BodyHandlers.ofString());
            int status = response.statusCode();
            fields.put("http_status", status);
            String level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
            String event = status >= 400 ? "stock.reservation.rejected" : "stock.reservation.completed";
            logger.write(context, level, event, "Products stock reservation response received", elapsed(started), fields);
            return new Result(status, response.body());
        } catch (HttpTimeoutException failure) {
            fields.put("failure_kind", "timeout");
            logger.write(context, "WARN", "stock.reservation.timeout", "Products did not answer before the client deadline",
                elapsed(started), fields);
            return failure(context);
        } catch (IOException failure) {
            logger.write(context, "ERROR", "stock.reservation.failed", "Products request could not complete", elapsed(started), fields);
            return failure(context);
        } catch (InterruptedException failure) {
            Thread.currentThread().interrupt();
            logger.write(context, "ERROR", "stock.reservation.failed", "Products request was interrupted", elapsed(started), fields);
            return failure(context);
        }
    }

    private Result failure(TraceContext context) {
        return new Result(500, "{\"error\":\"INTERNAL_ERROR\",\"message\":\"Products request failed\",\"traceId\":\""
            + context.correlationId() + "\"}");
    }

    private double elapsed(long started) { return (System.nanoTime() - started) / 1_000_000.0; }
    @Override public void close() { http.close(); }
}