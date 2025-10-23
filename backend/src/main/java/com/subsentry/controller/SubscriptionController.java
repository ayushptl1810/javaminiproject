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
    public ResponseEntity<?> getAllSubscriptions(@RequestParam(required = false) String category,
                                                @RequestParam(required = false) String search) {
        try {
            List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(category, search);
            return ResponseEntity.ok(Map.of("data", subscriptions, "total", subscriptions.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch subscriptions"));
        }
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingSubscriptions(@RequestParam(defaultValue = "7") int days) {
        try {
            List<Subscription> subscriptions = subscriptionService.getUpcomingSubscriptions(days);
            return ResponseEntity.ok(Map.of("data", subscriptions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch upcoming subscriptions"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubscriptionById(@PathVariable String id) {
        try {
            Subscription subscription = subscriptionService.getSubscriptionById(id);
            return ResponseEntity.ok(Map.of("data", subscription));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subscription not found"));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createSubscription(@RequestBody Subscription subscription) {
        try {
            Subscription created = subscriptionService.createSubscription(subscription);
            return ResponseEntity.ok(Map.of("data", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create subscription"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubscription(@PathVariable String id, @RequestBody Subscription subscription) {
        try {
            Subscription updated = subscriptionService.updateSubscription(id, subscription);
            return ResponseEntity.ok(Map.of("data", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update subscription"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubscription(@PathVariable String id) {
        try {
            subscriptionService.deleteSubscription(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete subscription"));
        }
    }
    
    @PutMapping("/bulk")
    public ResponseEntity<?> bulkUpdateSubscriptions(@RequestBody Map<String, Object> updates) {
        try {
            subscriptionService.bulkUpdateSubscriptions(updates);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to bulk update subscriptions"));
        }
    }
    
    @DeleteMapping("/bulk")
    public ResponseEntity<?> bulkDeleteSubscriptions(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> ids = (List<String>) request.get("ids");
            subscriptionService.bulkDeleteSubscriptions(ids);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to bulk delete subscriptions"));
        }
    }
    
    @PostMapping("/import")
    public ResponseEntity<?> importSubscriptions(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            int importedCount = subscriptionService.importSubscriptions(file);
            return ResponseEntity.ok(Map.of("success", true, "imported", importedCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to import subscriptions"));
        }
    }
    
    @GetMapping("/export")
    public ResponseEntity<?> exportSubscriptions(@RequestParam(defaultValue = "csv") String format,
                                               @RequestParam(required = false) String category) {
        try {
            String exportData = subscriptionService.exportSubscriptions(format, category);
            return ResponseEntity.ok(Map.of("data", exportData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to export subscriptions"));
        }
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<?> getSubscriptionsByDateRange(@RequestParam String startDate,
                                                        @RequestParam String endDate) {
        try {
            List<Subscription> subscriptions = subscriptionService.getSubscriptionsByDateRange(startDate, endDate);
            return ResponseEntity.ok(Map.of("data", subscriptions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch subscriptions by date range"));
        }
    }
}
