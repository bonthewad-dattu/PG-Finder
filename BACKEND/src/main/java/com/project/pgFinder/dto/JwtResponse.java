package com.project.pgFinder.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String role;
}
