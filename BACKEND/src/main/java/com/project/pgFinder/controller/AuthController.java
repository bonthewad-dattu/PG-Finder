package com.project.pgFinder.controller;

import com.project.pgFinder.config.JwtUtil;
import com.project.pgFinder.dto.JwtResponse;
import com.project.pgFinder.dto.LoginRequest;
import com.project.pgFinder.dto.RegisterRequest;
import com.project.pgFinder.entity.User;
import com.project.pgFinder.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@ModelAttribute RegisterRequest request) throws IOException {
        HashMap<String,Object> res = new HashMap<>();
        try
        {
            String filepath = Paths.get("").toAbsolutePath().toString();
            Path path = Paths.get(filepath,"src","main","resources","static","images",request.getImage().getOriginalFilename());
            String filename = request.getImage().getOriginalFilename();
            request.getImage().transferTo(path);

            User user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole())
                    .mobileNumber(request.getMobileNumber())
                    .address(request.getAddress())
                    .image(filename)
                    .build();
            userService.register(user);
            res.put("success",true);
            res.put("msg","user registered successfully");
            return ResponseEntity.ok(res);
        }
        catch (Exception e)
        {
            res.put("success",false);
            res.put("error","Failed to register the user");
            return ResponseEntity.status(500).body(res);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request)
    {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);
            JwtResponse response = new JwtResponse();
            response.setToken(jwt);
            response.setRole(userDetails.getAuthorities().iterator().next().getAuthority().substring(5)); // Remove "ROLE_"

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    @GetMapping("/get/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Fetch the user by userId
            User user = userService.getUserById(userId);
            if (user == null) {
                response.put("success", false);
                response.put("msg", "User not found for provided id: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Prepare response with user details
            response.put("success", true);
            response.put("user", user);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("msg", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/get/user/id")
    public ResponseEntity<?> getUserById()
    {
        HashMap<String,Object> res = new HashMap<>();
        try
        {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = (User) authentication.getPrincipal();
            res.put("success",true);
            res.put("user",user);
            return ResponseEntity.ok(res);
        }
        catch (Exception e){
            res.put("success",false);
            res.put("error","Failed to fetch the user");
            return ResponseEntity.status(404).body(res);
        }
    }


    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateUserId(
            @PathVariable Long userId,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("mobileNumber") String mobileNumber,
            @RequestParam("role") String role,
            @RequestParam("address") String address,
            @RequestParam("image") MultipartFile image) {

        Map<String, Object> response = new HashMap<>();
        try {

            // Fetch the user to be updated
            User existingUser = userService.getUserById(userId);
            if (existingUser == null) {
                response.put("success", false);
                response.put("msg", "User not found for provided id: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }


            // Handle image upload
            String filepath = Paths.get("").toAbsolutePath().toString();
            Path imageFilePath = Paths.get(filepath, "src", "main", "resources", "static", "images", image.getOriginalFilename());
            String imageUrl = image.getOriginalFilename();
            image.transferTo(imageFilePath);

            // Update the user details
            existingUser.setUsername(fullName);
            existingUser.setEmail(email);
            existingUser.setPassword(passwordEncoder.encode(password));  // Encode the password before saving
            existingUser.setMobileNumber(mobileNumber);
            existingUser.setAddress(address);
            existingUser.setRole(role);  // Ensure role is properly set
            existingUser.setImage(imageUrl);

            userService.updateUser(existingUser);

            response.put("success", true);
            response.put("msg", "User updated successfully.");
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("msg", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}






