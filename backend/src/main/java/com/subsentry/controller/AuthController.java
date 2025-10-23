package com.subsentry.controller;

import com.subsentry.model.User;
import com.subsentry.service.AuthService;
import com.subsentry.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login attempt for email: " + loginRequest.getEmail());
            User user = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            
            if (user != null) {
                System.out.println("Authentication successful for user: " + user.getName());
                String token = jwtUtil.generateToken(user.getEmail());
                
                Map<String, Object> response = new HashMap<>();
                response.put("user", user);
                response.put("token", token);
                
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Authentication failed - user is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            System.out.println("Authentication exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            User user = new User(signupRequest.getName(), signupRequest.getEmail(), signupRequest.getPassword());
            User savedUser = authService.register(user);
            
            String token = jwtUtil.generateToken(savedUser.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", savedUser);
            response.put("token", token);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed"));
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            if (jwtUtil.validateToken(cleanToken)) {
                String email = jwtUtil.getEmailFromToken(cleanToken);
                User user = authService.verifyToken(cleanToken);
                return ResponseEntity.ok(Map.of("user", user));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token verification failed"));
        }
    }
    
    // Request DTOs
    public static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class SignupRequest {
        private String name;
        private String email;
        private String password;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}