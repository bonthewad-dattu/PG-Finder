package com.project.pgFinder.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String role;
    private String mobileNumber;
    private String address;
    private MultipartFile image;
}
