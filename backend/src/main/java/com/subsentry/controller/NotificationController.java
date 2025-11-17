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
    public ResponseEntity<?> getNotifications(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(Map.of("data", notificationService.getNotifications(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch notifications"));
        }
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id, @RequestParam String userId) {
        try {
            notificationService.markAsRead(userId, id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to mark notification as read"));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam String userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to mark all notifications as read"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id, @RequestParam String userId) {
        try {
            notificationService.deleteNotification(userId, id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete notification"));
        }
    }
    
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestParam String userId, @RequestBody Map<String, Object> preferences) {
        try {
            notificationService.updatePreferences(userId, preferences);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update preferences"));
        }
    }
    
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(Map.of("data", notificationService.getPreferences(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch preferences"));
        }
    }
    
    @PostMapping("/test")
    public ResponseEntity<?> testNotification(@RequestParam String userId, @RequestBody Map<String, Object> request) {
        try {
            String type = (String) request.get("type");
            notificationService.testNotification(userId, type);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to test notification"));
        }
    }
}
