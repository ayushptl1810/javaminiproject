package com.subsentry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for SubSentry Backend API
 * 
 * Features:
 * - Subscription management
 * - User authentication and authorization
 * - Analytics and reporting
 * - Notification system
 * - Email integration
 */
@SpringBootApplication
@EnableScheduling
public class SubSentryApplication {

    public static void main(String[] args) {
        SpringApplication.run(SubSentryApplication.class, args);
    }
}
