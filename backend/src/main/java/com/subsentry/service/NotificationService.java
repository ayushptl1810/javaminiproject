package com.subsentry.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationService {
    
    private List<Map<String, Object>> mockNotifications = new ArrayList<>();
    
    public NotificationService() {
        initializeMockData();
    }
    
    private void initializeMockData() {
        Map<String, Object> notif1 = new HashMap<>();
        notif1.put("id", "notif-1");
        notif1.put("type", "renewal");
        notif1.put("message", "Your Adobe Creative Cloud subscription renews tomorrow!");
        notif1.put("date", LocalDateTime.now().minusDays(1));
        notif1.put("read", false);
        notif1.put("link", "/calendar");
        mockNotifications.add(notif1);
        
        Map<String, Object> notif2 = new HashMap<>();
        notif2.put("id", "notif-2");
        notif2.put("type", "renewal");
        notif2.put("message", "Spotify Premium renews in 2 days.");
        notif2.put("date", LocalDateTime.now());
        notif2.put("read", false);
        notif2.put("link", "/calendar");
        mockNotifications.add(notif2);
        
        Map<String, Object> notif3 = new HashMap<>();
        notif3.put("id", "notif-3");
        notif3.put("type", "info");
        notif3.put("message", "Welcome to SubSentry! Explore your dashboard.");
        notif3.put("date", LocalDateTime.now().minusDays(7));
        notif3.put("read", true);
        notif3.put("link", "/dashboard");
        mockNotifications.add(notif3);
    }
    
    public Map<String, Object> getNotifications() {
        Map<String, Object> result = new HashMap<>();
        result.put("notifications", mockNotifications);
        return result;
    }
    
    public void markAsRead(String id) {
        mockNotifications.stream()
                .filter(notif -> notif.get("id").equals(id))
                .findFirst()
                .ifPresent(notif -> notif.put("read", true));
    }
    
    public void markAllAsRead() {
        mockNotifications.forEach(notif -> notif.put("read", true));
    }
    
    public void deleteNotification(String id) {
        mockNotifications.removeIf(notif -> notif.get("id").equals(id));
    }
    
    public void updatePreferences(Map<String, Object> preferences) {
        System.out.println("Updating notification preferences: " + preferences);
    }
    
    public Map<String, Object> getPreferences() {
        Map<String, Object> preferences = new HashMap<>();
        preferences.put("emailNotifications", true);
        preferences.put("browserNotifications", true);
        preferences.put("reminderDays", 2);
        return preferences;
    }
    
    public void testNotification(String type) {
        System.out.println("Testing notification of type: " + type);
    }
}
