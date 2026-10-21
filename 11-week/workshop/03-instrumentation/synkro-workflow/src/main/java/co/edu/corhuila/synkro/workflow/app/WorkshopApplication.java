package co.edu.corhuila.synkro.workflow.app;

import co.edu.corhuila.synkro.workflow.adapter.observability.*;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class WorkshopApplication {
    public static void main(String[] args) { SpringApplication.run(WorkshopApplication.class, args); }

    @Bean TraceContextFilter traceFilter(@Value("${app.version}") String version,
                                         @Value("${app.environment}") String environment) {
        return new TraceContextFilter(new JsonRequestLogger(System.out, version, environment));
    }

    @GetMapping("/health") Map<String, String> health() {
        return Map.of("status", "ok", "service", "synkro-workflow");
    }
}