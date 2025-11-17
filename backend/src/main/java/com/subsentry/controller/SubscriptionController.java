package com.subsentry.controller;

import com.subsentry.model.Subscription;
import com.subsentry.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {
    
    @Autowired
    private SubscriptionService subscriptionService;
    
    @GetMapping
    public ResponseEntity<?> getAllSubscriptions(@RequestParam String userId,
                                                @RequestParam(required = false) String category,
                                                @RequestParam(required = false) String search) {
        try {
            List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, category, search);
            return ResponseEntity.ok(Map.of("data", subscriptions, "total", subscriptions.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch subscriptions"));
        }
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingSubscriptions(@RequestParam String userId,
                                                     @RequestParam(defaultValue = "7") int days) {
        try {
            List<Subscription> subscriptions = subscriptionService.getUpcomingSubscriptions(userId, days);
            return ResponseEntity.ok(Map.of("data", subscriptions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch upcoming subscriptions"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubscriptionById(@RequestParam String userId, @PathVariable String id) {
        try {
            Subscription subscription = subscriptionService.getSubscriptionById(userId, id);
            return ResponseEntity.ok(Map.of("data", subscription));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subscription not found"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createSubscription(@RequestParam String userId, @RequestBody Subscription subscription) {
        try {
            Subscription created = subscriptionService.createSubscription(userId, subscription);
            return ResponseEntity.ok(Map.of("data", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create subscription"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubscription(@RequestParam String userId,
                                                @PathVariable String id,
                                                @RequestBody Subscription subscription) {
        try {
            Subscription updated = subscriptionService.updateSubscription(userId, id, subscription);
            return ResponseEntity.ok(Map.of("data", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update subscription"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubscription(@RequestParam String userId, @PathVariable String id) {
        try {
            subscriptionService.deleteSubscription(userId, id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete subscription"));
        }
    }
    
    @PutMapping("/bulk")
    public ResponseEntity<?> bulkUpdateSubscriptions(@RequestParam String userId,
                                                     @RequestBody Map<String, Object> updates) {
        try {
            subscriptionService.bulkUpdateSubscriptions(userId, updates);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to bulk update subscriptions"));
        }
    }
    
    @DeleteMapping("/bulk")
    public ResponseEntity<?> bulkDeleteSubscriptions(@RequestParam String userId,
                                                     @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> ids = (List<String>) request.get("ids");
            subscriptionService.bulkDeleteSubscriptions(userId, ids);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to bulk delete subscriptions"));
        }
    }
    
    @PostMapping("/import")
    public ResponseEntity<?> importSubscriptions(@RequestParam String userId,
                                                 @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            int importedCount = subscriptionService.importSubscriptions(userId, file);
            return ResponseEntity.ok(Map.of("success", true, "imported", importedCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to import subscriptions"));
        }
    }
    
    @GetMapping("/export")
    public ResponseEntity<?> exportSubscriptions(@RequestParam String userId,
                                               @RequestParam(defaultValue = "csv") String format,
                                               @RequestParam(required = false) String category) {
        try {
            String exportData = subscriptionService.exportSubscriptions(userId, format, category);
            return ResponseEntity.ok(Map.of("data", exportData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to export subscriptions"));
        }
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<?> getSubscriptionsByDateRange(@RequestParam String userId,
                                                        @RequestParam String startDate,
                                                        @RequestParam String endDate) {
        try {
            List<Subscription> subscriptions = subscriptionService.getSubscriptionsByDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(Map.of("data", subscriptions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch subscriptions by date range"));
        }
    }
}
