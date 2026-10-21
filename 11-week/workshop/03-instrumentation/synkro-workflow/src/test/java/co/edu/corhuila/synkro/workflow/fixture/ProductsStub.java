package co.edu.corhuila.synkro.workflow.fixture;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public final class ProductsStub {
    public static void main(String[] args) throws Exception {
        int port = args.length == 0 ? 18089 : Integer.parseInt(args[0]);
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/api/v1/stock-reservations", exchange -> {
            exchange.getRequestBody().readAllBytes();
            System.out.println("Products fixture received " + exchange.getRequestMethod() + " " + exchange.getRequestURI().getPath());
            System.out.println("traceparent: " + exchange.getRequestHeaders().getFirst("traceparent"));
            System.out.println("X-Correlation-Id: " + exchange.getRequestHeaders().getFirst("X-Correlation-Id"));
            String body = """
                {"reservationId":"65920dc9-bd55-41a0-8e41-5832377383e5","status":"RESERVED","createdAt":"2026-10-21T01:00:00.000Z","lines":[{"lineId":"75920dc9-bd55-41a0-8e41-5832377383e5","productId":"550e8400-e29b-41d4-a716-446655440000","quantity":2,"unitPriceCents":100000}]}
                """;
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(201, bytes.length);
            try (var output = exchange.getResponseBody()) { output.write(bytes); }
            exchange.close();
        });
        server.start();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> server.stop(0)));
        System.out.println("Products fixture listening on 127.0.0.1:" + port + " (fixed response, no real stock)");
    }
}