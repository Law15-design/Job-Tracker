package com.jobtracker.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/api/*")
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-App-Password");

        // browser send this automatically before the real request, just allow it
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // only check password if we actually set one
        String requiredPassword = System.getenv("APP_PASSWORD");
        if (requiredPassword != null && !requiredPassword.isBlank()) {
            String givenPassword = request.getHeader("X-App-Password");
            if (!requiredPassword.equals(givenPassword)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\"}");
                return;
            }
        }

        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) { }

    @Override
    public void destroy() { }
}