package co.edu.corhuila.synkro.workflow.adapter.observability;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.UUID;
import java.util.regex.Pattern;

public record TraceContext(String traceId, String spanId, String parentSpanId,
                           String flags, String correlationId) {
    private static final Pattern HEADER = Pattern.compile("00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})");
    private static final Pattern UUID_TEXT = Pattern.compile("[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}");
    private static final SecureRandom RANDOM = new SecureRandom();

    public static TraceContext fromHeaders(String incoming, String correlation) {
        var match = HEADER.matcher(incoming == null ? "" : incoming);
        boolean valid = match.matches() && !match.group(1).equals("0".repeat(32))
            && !match.group(2).equals("0".repeat(16));
        String safeCorrelation = correlation != null && UUID_TEXT.matcher(correlation).matches()
            ? correlation : UUID.randomUUID().toString();
        return new TraceContext(valid ? match.group(1) : randomHex(16), randomHex(8),
            valid ? match.group(2) : null, valid ? match.group(3) : "01", safeCorrelation);
    }

    public String traceparent() { return "00-" + traceId + "-" + spanId + "-" + flags; }

    static boolean isUuid(Object value) {
        return value instanceof String text && UUID_TEXT.matcher(text).matches();
    }

    private static String randomHex(int size) {
        byte[] bytes = new byte[size];
        String value;
        do {
            RANDOM.nextBytes(bytes);
            value = HexFormat.of().formatHex(bytes);
        } while (value.equals("0".repeat(size * 2)));
        return value;
    }
}