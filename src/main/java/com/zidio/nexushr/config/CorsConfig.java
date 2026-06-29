package com.zidio.nexushr.config;

/**
 * CORS configuration has been moved into {@link SecurityConfig#corsConfigurationSource()}.
 *
 * Registering a standalone CorsFilter bean alongside Spring Security's CORS support
 * caused filter-chain conflicts where the Security filter (at higher precedence) would
 * reject pre-flight OPTIONS requests before the CorsFilter could respond to them.
 *
 * The CorsConfigurationSource bean in SecurityConfig reads allowed origins from the
 * {@code app.cors.allowed-origins} property, so you can configure origins per environment:
 *
 *   app:
 *     cors:
 *       allowed-origins:
 *         - http://localhost:3000
 *         - https://nexushr.yourdomain.com
 */
public class CorsConfig {
    // Intentionally empty — see SecurityConfig
}
