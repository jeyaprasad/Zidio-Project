package com.zidio.nexushr.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970337336763979244226452948404D635166546A576E5A7234753778214125442A47";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, EXPIRATION_MS);
    }

    @Test
    void testGenerateAndValidateToken() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("testuser@example.com", null, Collections.emptyList());
        
        String token = jwtTokenProvider.generateToken(authentication);
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        
        String email = jwtTokenProvider.getEmailFromToken(token);
        assertEquals("testuser@example.com", email);
    }

    @Test
    void testInvalidToken() {
        String invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token";
        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }
}
