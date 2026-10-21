package co.edu.corhuila.synkro.workflow.adapter.observability;

import java.util.*;

public final class RequestMetrics {
    private static final String COUNTER = "synkro_workflow_requests_total";
    private static final String HISTOGRAM = "synkro_workflow_request_duration_seconds";
    private static final double[] BOUNDS = {0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 10};
    private static final String[] OUTCOMES = {"success", "business_rejected", "technical_failure"};
    private final Map<Labels, Sample> samples = new LinkedHashMap<>();
    private record Labels(String route, String method) {}
    private static final class Sample {
        final long[] results = new long[3];
        final long[] buckets = new long[BOUNDS.length];
        long count;
        double sum;
    }

    public synchronized void observe(String method, String path, int status, boolean completed, double seconds) {
        if (path.equals("/metrics")) return;
        String route = path.equals("/health") ? "/health"
            : path.matches("/workshop/stock-reservations/[a-fA-F0-9-]{36}")
                ? "/workshop/stock-reservations/{sagaId}" : "other";
        String boundedMethod = Set.of("GET", "POST").contains(method) ? method : "OTHER";
        var sample = samples.computeIfAbsent(new Labels(route, boundedMethod), key -> new Sample());
        int outcome = !completed || status >= 500 ? 2 : status >= 400 ? 1 : 0;
        sample.results[outcome]++;
        sample.count++;
        sample.sum += seconds;
        for (int i = 0; i < BOUNDS.length; i++) if (seconds <= BOUNDS[i]) sample.buckets[i]++;
    }

    public synchronized String scrape() {
        var text = new StringBuilder("# HELP " + COUNTER + " Workflow HTTP requests by result.\n# TYPE " + COUNTER + " counter\n");
        samples.forEach((labels, sample) -> {
            for (int i = 0; i < OUTCOMES.length; i++)
                text.append(COUNTER).append("{").append(labels(labels)).append(",outcome=\"")
                    .append(OUTCOMES[i]).append("\"} ").append(sample.results[i]).append("\n");
        });
        text.append("# HELP ").append(HISTOGRAM).append(" Workflow HTTP latency in seconds.\n# TYPE ")
            .append(HISTOGRAM).append(" histogram\n");
        samples.forEach((labels, sample) -> {
            String tags = labels(labels);
            for (int i = 0; i < BOUNDS.length; i++)
                text.append(HISTOGRAM).append("_bucket{").append(tags).append(",le=\"")
                    .append(BOUNDS[i]).append("\"} ").append(sample.buckets[i]).append("\n");
            text.append(HISTOGRAM).append("_bucket{").append(tags).append(",le=\"+Inf\"} ")
                .append(sample.count).append("\n");
            text.append(HISTOGRAM).append("_sum{").append(tags).append("} ").append(sample.sum).append("\n");
            text.append(HISTOGRAM).append("_count{").append(tags).append("} ").append(sample.count).append("\n");
        });
        return text.toString();
    }

    private String labels(Labels labels) {
        return "route=\"" + labels.route() + "\",method=\"" + labels.method() + "\"";
    }
}