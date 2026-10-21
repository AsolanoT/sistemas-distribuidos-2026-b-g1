package co.edu.corhuila.synkro.workflow.adapter.observability;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;
import org.springframework.web.filter.OncePerRequestFilter;

public final class TraceContextFilter extends OncePerRequestFilter {
    public static final String CONTEXT = TraceContextFilter.class.getName() + ".context";
    private final JsonRequestLogger logger;

    public TraceContextFilter(JsonRequestLogger logger) { this.logger = logger; }

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                              FilterChain chain) throws ServletException, IOException {
        var context = TraceContext.fromHeaders(singleHeader(request, "traceparent"),
            singleHeader(request, "X-Correlation-Id"));
        request.setAttribute(CONTEXT, context);
        response.setHeader("traceparent", context.traceparent());
        response.setHeader("X-Correlation-Id", context.correlationId());
        long started = System.nanoTime();
        boolean completed = false;
        try {
            chain.doFilter(request, response);
            completed = true;
        } finally {
            int status = response.getStatus();
            String outcome = !completed || status >= 500 ? "technical_failure"
                : status >= 400 ? "business_rejected" : "success";
            String level = !completed || status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
            Map<String, Object> fields = new HashMap<>();
            fields.put("outcome", outcome);
            if (completed) fields.put("http_status", status);
            logger.write(context, level, "http.request.completed", "Workflow HTTP request finished",
                (System.nanoTime() - started) / 1_000_000.0, fields);
        }
    }

    private String singleHeader(HttpServletRequest request, String name) {
        var values = Collections.list(request.getHeaders(name));
        return values.size() == 1 ? values.getFirst() : null;
    }
}