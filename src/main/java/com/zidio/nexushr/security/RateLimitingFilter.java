package com.zidio.nexushr.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;

    // Limit: 10 requests per minute per IP for authentication endpoints
    private static final int MAX_REQUESTS = 10;
    private static final long TIME_WINDOW_MINUTES = 1;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if ("/api/auth/login".equals(path) || "/api/auth/register".equals(path)) {
            String ip = request.getRemoteAddr();
            String key = "rate:auth:" + ip;

            try {
                String val = redisTemplate.opsForValue().get(key);
                int count = 0;
                if (val != null) {
                    count = Integer.parseInt(val);
                }

                if (count >= MAX_REQUESTS) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Too many login/registration attempts. Please try again later.\"}");
                    return;
                }

                if (val == null) {
                    redisTemplate.opsForValue().set(key, "1", TIME_WINDOW_MINUTES, TimeUnit.MINUTES);
                } else {
                    redisTemplate.opsForValue().increment(key);
                }
            } catch (Exception e) {
                // Fail-open if Redis is down (e.g. in test envs without active Redis container)
                log.warn("Redis connection unavailable for rate limiting: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
