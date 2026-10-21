package co.edu.corhuila.synkro.workflow.adapter.observability;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.PrintStream;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

public final class JsonRequestLogger {
    private static final DateTimeFormatter UTC = DateTimeFormatter
        .ofPattern("uuuu-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);
    private final ObjectMapper json = new ObjectMapper();
    private final PrintStream output;
    private final String version;
    private final String environment;

    public JsonRequestLogger(PrintStream output, String version, String environment) {
        this.output = Objects.requireNonNull(output);
        this.version = Objects.requireNonNull(version);
        if (!Set.of("dev", "qa", "prod").contains(environment)) throw new IllegalArgumentException("Invalid environment");
        this.environment = environment;
    }

    public void write(TraceContext context, String level, String event, String message,
                      double durationMs, Map<String, ?> fields) {
        if (!Set.of("DEBUG", "INFO", "WARN", "ERROR").contains(level)
                || !Double.isFinite(durationMs) || durationMs < 0)
            throw new IllegalArgumentException("Invalid log level or duration");
        if (level.equals("DEBUG") && environment.equals("prod")) return;
        var record = new LinkedHashMap<String, Object>();
        record.put("timestamp", UTC.format(Instant.now()));
        record.put("level", level);
        record.put("service", "synkro-workflow");
        record.put("version", version);
        record.put("environment", environment);
        record.put("trace_id", context.traceId());
        record.put("span_id", context.spanId());
        record.put("correlation_id", context.correlationId());
        record.put("correlationId", context.correlationId());
        record.put("event", event);
        record.put("message", message);
        record.put("duration_ms", durationMs);
        fields.forEach((key, value) -> { if (allowed(key, value)) record.put(key, value); });
        try { output.println(json.writeValueAsString(record)); }
        catch (JsonProcessingException failure) { throw new IllegalStateException("Log serialization failed"); }
    }

    private boolean allowed(String key, Object value) {
        if (value == null) return false;
        return switch (key) {
            case "saga_id", "customer_id", "product_id", "reservation_id", "sale_id" -> TraceContext.isUuid(value);
            case "quantity", "attempt" -> value instanceof Integer number && number > 0;
            case "available_stock" -> value instanceof Integer number && number >= 0;
            case "http_status" -> value instanceof Integer number && number >= 100 && number <= 599;
            case "step" -> Set.of("validate-customer", "reserve-stock", "register-sale", "release-stock").contains(value);
            case "saga_status" -> Set.of("RUNNING", "COMPLETED", "COMPENSATED", "FAILED").contains(value);
            case "outcome" -> Set.of("success", "business_rejected", "technical_failure").contains(value);
            case "failure_kind" -> "timeout".equals(value);
            case "downstream_service" -> Set.of("synkro-customers-api", "synkro-products-api", "synkro-sales-api").contains(value);
            case "error_code" -> Set.of("VALIDATION_ERROR", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND",
                "INVALID_STATUS_TRANSITION", "BUSINESS_RULE_VIOLATION", "INTERNAL_ERROR").contains(value);
            default -> false;
        };
    }
}