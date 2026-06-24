package com.zidio.nexushr.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider tokenProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            
            // Try to extract token from query parameter: e.g. /ws?token=xxx
            String token = servletRequest.getServletRequest().getParameter("token");
            
            if (token == null) {
                // Alternatively try to extract from Authorization header
                String authHeader = servletRequest.getServletRequest().getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            if (token != null && tokenProvider.validateToken(token)) {
                String email = tokenProvider.getEmailFromToken(token);
                attributes.put("email", email);
                return true; // Token is valid, allow handshake
            }
        }
        log.warn("WebSocket handshake rejected: Missing or invalid JWT token.");
        return false; // Reject handshake
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}
