package com.subsentry.service;

import com.subsentry.model.User;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    // Placeholder implementation for now
    public User authenticate(String email, String password) {
        // Mock authentication for demo
        if ("test@subsentry.com".equals(email) && "password123".equals(password)) {
            User user = new User();
            user.setId("test-user-123");
            user.setName("Test User");
            user.setEmail("test@subsentry.com");
            user.setPassword("password123"); // Set password for demo
            return user;
        }
        return null;
    }
    
    public User register(User user) {
        // Mock registration for demo
        user.setId("new-user-" + System.currentTimeMillis());
        return user;
    }
    
    public User verifyToken(String token) {
        // Mock token verification for demo
        User user = new User();
        user.setId("test-user-123");
        user.setName("Test User");
        user.setEmail("test@subsentry.com");
        return user;
    }
}
