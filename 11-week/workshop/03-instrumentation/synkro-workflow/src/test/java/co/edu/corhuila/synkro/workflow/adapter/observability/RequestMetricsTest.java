package co.edu.corhuila.synkro.workflow.adapter.observability;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RequestMetricsTest {
    @Test void exportsCounterAndCumulativeLatencyHistogramInSeconds() {
        var metrics = new RequestMetrics();
        metrics.observe("POST", "/workshop/stock-reservations/15920dc9-bd55-41a0-8e41-5832377383e5", 201, true, 0.2);
        metrics.observe("POST", "/workshop/stock-reservations/25920dc9-bd55-41a0-8e41-5832377383e5", 422, true, 0.4);
        String text = metrics.scrape();
        assertTrue(text.contains("synkro_workflow_requests_total{route=\"/workshop/stock-reservations/{sagaId}\",method=\"POST\",outcome=\"success\"} 1"));
        assertTrue(text.contains("outcome=\"business_rejected\"} 1"));
        assertTrue(text.contains("le=\"0.25\"} 1"));
        assertTrue(text.contains("le=\"0.5\"} 2"));
        assertTrue(text.contains("le=\"+Inf\"} 2"));
        assertTrue(text.contains("synkro_workflow_request_duration_seconds_count{route=\"/workshop/stock-reservations/{sagaId}\",method=\"POST\"} 2"));
        assertTrue(text.contains("synkro_workflow_request_duration_seconds_sum"));
        assertFalse(text.contains("15920dc9"));
        assertFalse(text.contains("25920dc9"));
    }

    @Test void excludesScrapesAndBoundsUnknownRoutesAndMethods() {
        var metrics = new RequestMetrics();
        metrics.observe("GET", "/metrics", 200, true, 0.01);
        metrics.observe("UNTRUSTED", "/customers/private-user-id", 500, false, 0.1);
        String text = metrics.scrape();
        assertFalse(text.contains("route=\"/metrics\""));
        assertFalse(text.contains("private-user-id"));
        assertFalse(text.contains("UNTRUSTED"));
        assertTrue(text.contains("route=\"other\",method=\"OTHER\",outcome=\"technical_failure\"} 1"));
    }
}