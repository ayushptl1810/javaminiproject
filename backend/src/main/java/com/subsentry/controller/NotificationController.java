package com.subsentry.controller;

import com.subsentry.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<?> getNotifications() {
        try {
            Map<String, Object> notifications = notificationService.getNotifications();
            return ResponseEntity.ok(Map.of("data", notifications.get("notifications")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch notifications"));
        }
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to mark notification as read"));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        try {
            notificationService.markAllAsRead();
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to mark all notifications as read"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete notification"));
        }
    }
    
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody Map<String, Object> preferences) {
        try {
            notificationService.updatePreferences(preferences);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update preferences"));
        }
    }
    
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences() {
        try {
            Map<String, Object> preferences = notificationService.getPreferences();
            return ResponseEntity.ok(Map.of("data", preferences));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch preferences"));
        }
    }
    
    @PostMapping("/test")
    public ResponseEntity<?> testNotification(@RequestBody Map<String, Object> request) {
        try {
            String type = (String) request.get("type");
            notificationService.testNotification(type);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to test notification"));
        }
    }
}
