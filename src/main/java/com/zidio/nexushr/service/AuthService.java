package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.AuthResponse;
import com.zidio.nexushr.dto.LoginRequest;
import com.zidio.nexushr.dto.RegisterRequest;
import com.zidio.nexushr.entity.Role;
import com.zidio.nexushr.entity.User;
import com.zidio.nexushr.exception.DuplicateResourceException;
import com.zidio.nexushr.repository.UserRepository;
import com.zidio.nexushr.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate redisTemplate;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.EMPLOYEE)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), 
                null, 
                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        String token = jwtTokenProvider.generateToken(authentication);
        String refreshToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set("refresh:" + refreshToken, user.getEmail(), 7, TimeUnit.DAYS);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getId())
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String refreshToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set("refresh:" + refreshToken, user.getEmail(), 7, TimeUnit.DAYS);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getId())
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = redisTemplate.opsForValue().get("refresh:" + refreshToken);
        if (email == null) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        User user = userRepository.findByEmail(email).orElseThrow();
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), 
                null, 
                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        String newToken = jwtTokenProvider.generateToken(authentication);
        String newRefreshToken = UUID.randomUUID().toString();
        redisTemplate.delete("refresh:" + refreshToken);
        redisTemplate.opsForValue().set("refresh:" + newRefreshToken, user.getEmail(), 7, TimeUnit.DAYS);

        return AuthResponse.builder()
                .token(newToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getId())
                .refreshToken(newRefreshToken)
                .build();
    }

    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        redisTemplate.opsForValue().set("blacklist:" + token, "revoked", 24, TimeUnit.HOURS);
    }
}
