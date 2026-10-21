package co.edu.corhuila.synkro.workflow.adapter.http;

import co.edu.corhuila.synkro.workflow.adapter.observability.*;
import co.edu.corhuila.synkro.workflow.adapter.participants.ProductsClient;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public final class ReservationProbeController {
    private final ProductsClient products;
    public ReservationProbeController(ProductsClient products) { this.products = products; }

    @PostMapping("/workshop/stock-reservations/{sagaId}")
    public ResponseEntity<?> reserve(@PathVariable UUID sagaId,
            @RequestBody ProductsClient.ReservationRequest body, HttpServletRequest request) {
        var context = (TraceContext) request.getAttribute(TraceContextFilter.CONTEXT);
        if (body.lines() == null || body.lines().isEmpty() || body.lines().size() > 100
                || body.lines().stream().anyMatch(line -> line == null || line.productId() == null || line.quantity() <= 0)
                || body.lines().stream().map(ProductsClient.Line::productId).distinct().count() != body.lines().size())
            return ResponseEntity.badRequest().body(Map.of("error", "VALIDATION_ERROR",
                "message", "Provide 1 to 100 distinct products with positive quantities", "traceId", context.correlationId()));
        var result = products.reserve(sagaId, body, context);
        return ResponseEntity.status(result.status()).contentType(MediaType.APPLICATION_JSON).body(result.body());
    }
}