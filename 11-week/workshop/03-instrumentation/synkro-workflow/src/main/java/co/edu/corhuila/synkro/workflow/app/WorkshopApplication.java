package co.edu.corhuila.synkro.workflow.app;

import co.edu.corhuila.synkro.workflow.adapter.http.ReservationProbeController;
import co.edu.corhuila.synkro.workflow.adapter.observability.*;
import co.edu.corhuila.synkro.workflow.adapter.participants.ProductsClient;
import java.net.URI;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class WorkshopApplication {
    private final RequestMetrics metrics = new RequestMetrics();
    public static void main(String[] args) { SpringApplication.run(WorkshopApplication.class, args); }

    @Bean JsonRequestLogger requestLogger(@Value("${app.version}") String version,
                                          @Value("${app.environment}") String environment) {
        return new JsonRequestLogger(System.out, version, environment);
    }

    @Bean TraceContextFilter traceFilter(JsonRequestLogger logger) {
        return new TraceContextFilter(logger, metrics);
    }

    @Bean ProductsClient productsClient(@Value("${products.url}") URI url,
            @Value("${products.service-token}") String token,
            @Value("${products.timeout-ms}") long timeoutMs, JsonRequestLogger logger) {
        return new ProductsClient(url, token, Duration.ofMillis(timeoutMs), logger);
    }

    @Bean ReservationProbeController reservationProbe(ProductsClient products) {
        return new ReservationProbeController(products);
    }

    @GetMapping("/health") Map<String, String> health() {
        return Map.of("status", "ok", "service", "synkro-workflow");
    }

    @GetMapping(value = "/metrics", produces = "text/plain;version=0.0.4;charset=utf-8")
    String metrics() { return metrics.scrape(); }
}