package co.edu.corhuila.synkro.workflow.app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = WorkshopApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApplicationWiringTest {
    @Autowired TestRestTemplate http;

    @Test void servesMetricsAndDoesNotCountItsOwnScrapes() {
        assertEquals(200, http.getForEntity("/health", String.class).getStatusCode().value());
        var first = http.getForEntity("/metrics", String.class);
        assertEquals(200, first.getStatusCode().value());
        assertTrue(first.getHeaders().getContentType().toString().startsWith("text/plain"));
        assertTrue(first.getBody().contains("# TYPE synkro_workflow_requests_total counter"));
        assertTrue(first.getBody().contains("# TYPE synkro_workflow_request_duration_seconds histogram"));
        assertTrue(first.getBody().contains("route=\"/health\",method=\"GET\",outcome=\"success\"} 1"));
        assertEquals(first.getBody(), http.getForObject("/metrics", String.class));
    }
}