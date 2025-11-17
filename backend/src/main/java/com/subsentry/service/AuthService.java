package com.subsentry.service;

import com.subsentry.dao.UserDAO;
import com.subsentry.model.User;
import com.subsentry.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final boolean useMockData;
    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(@Value("${app.data.mode:mock}") String dataMode,
                    UserDAO userDAO,
                    PasswordEncoder passwordEncoder,
                    JwtUtil jwtUtil,
                    EmailService emailService) {
        this.useMockData = "mock".equalsIgnoreCase(dataMode);
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public User authenticate(String email, String password) {
        if (useMockData) {
            return authenticateMock(email, password);
        }
        User user = userDAO.getUserByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            user.setPassword(null);
            return user;
        }
        return null;
    }

    public User register(User user) {
        if (useMockData) {
            user.setId("new-user-" + System.currentTimeMillis());
            return user;
        }
        if (userDAO.getUserByEmail(user.getEmail()) != null) {
            throw new IllegalStateException("User already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        boolean created = userDAO.createUser(user);
        if (!created) {
            throw new IllegalStateException("Failed to save user");
        }
        user.setPassword(null);
        return user;
    }

    public User verifyToken(String token) {
        if (useMockData) {
            User user = new User();
            user.setId("test-user-123");
            user.setName("Test User");
            user.setEmail("test@subsentry.com");
            return user;
        }
        String email = jwtUtil.getEmailFromToken(token);
        User user = userDAO.getUserByEmail(email);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    public boolean isUsingMockData() {
        return useMockData;
    }

    private User authenticateMock(String email, String password) {
        if ("test@subsentry.com".equals(email) && "password123".equals(password)) {
            User user = new User();
            user.setId("test-user-123");
            user.setName("Test User");
            user.setEmail("test@subsentry.com");
            return user;
        }
        return null;
    }
}

