package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private Long userId;
    private String refreshToken;
}
