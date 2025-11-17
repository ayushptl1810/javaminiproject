package com.subsentry.controller;

import com.subsentry.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(@RequestParam String userId,
                                         @RequestParam(required = false) String dateRange) {
        try {
            Map<String, Object> overview = analyticsService.getOverview(userId, dateRange);
            return ResponseEntity.ok(Map.of("data", overview));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch analytics overview"));
        }
    }
    
    @GetMapping("/spending-trend")
    public ResponseEntity<?> getSpendingTrend(@RequestParam String userId,
                                              @RequestParam(required = false) String dateRange) {
        try {
            Map<String, Object> trend = analyticsService.getSpendingTrend(userId, dateRange);
            return ResponseEntity.ok(Map.of("data", trend));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch spending trend"));
        }
    }
    
    @GetMapping("/category-breakdown")
    public ResponseEntity<?> getCategoryBreakdown(@RequestParam String userId,
                                                  @RequestParam(required = false) String dateRange) {
        try {
            Map<String, Object> breakdown = analyticsService.getCategoryBreakdown(userId, dateRange);
            return ResponseEntity.ok(Map.of("data", breakdown));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch category breakdown"));
        }
    }
    
    @GetMapping("/billing-cycle")
    public ResponseEntity<?> getBillingCycleAnalysis(@RequestParam String userId,
                                                     @RequestParam(required = false) String dateRange) {
        try {
            Map<String, Object> analysis = analyticsService.getBillingCycleAnalysis(userId, dateRange);
            return ResponseEntity.ok(Map.of("data", analysis));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch billing cycle analysis"));
        }
    }
    
    @GetMapping("/top-subscriptions")
    public ResponseEntity<?> getTopSubscriptions(@RequestParam String userId,
                                                @RequestParam(required = false) String dateRange) {
        try {
            Map<String, Object> topSubs = analyticsService.getTopSubscriptions(userId, dateRange);
            return ResponseEntity.ok(Map.of("data", topSubs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch top subscriptions"));
        }
    }
    
    @GetMapping("/projections")
    public ResponseEntity<?> getProjections(@RequestParam String userId) {
        try {
            Map<String, Object> projections = analyticsService.getProjections(userId);
            return ResponseEntity.ok(Map.of("data", projections));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch projections"));
        }
    }
    
    @GetMapping("/insights")
    public ResponseEntity<?> getInsights(@RequestParam String userId) {
        try {
            Map<String, Object> insights = analyticsService.getInsights(userId);
            return ResponseEntity.ok(Map.of("data", insights));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch insights"));
        }
    }
    
    @PostMapping("/compare")
    public ResponseEntity<?> compareSubscriptions(@RequestParam String userId,
                                                  @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<String> subscriptionIds = (java.util.List<String>) request.get("subscriptionIds");
            Map<String, Object> comparison = analyticsService.compareSubscriptions(userId, subscriptionIds);
            return ResponseEntity.ok(Map.of("data", comparison));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to compare subscriptions"));
        }
    }
}
