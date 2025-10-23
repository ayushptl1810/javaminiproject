package com.subsentry.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {
    
    @Autowired
    private SubscriptionService subscriptionService;
    
    public Map<String, Object> getOverview() {
        List<com.subsentry.model.Subscription> subscriptions = subscriptionService.getAllSubscriptions(null, null);
        
        double totalMonthlySpending = subscriptions.stream()
                .mapToDouble(sub -> sub.getBillingCycle().equals("yearly") ? sub.getAmount() / 12 : sub.getAmount())
                .sum();
        
        double annualProjection = totalMonthlySpending * 12;
        double costPerDay = totalMonthlySpending / 30;
        
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalSubscriptions", subscriptions.size());
        overview.put("activeSubscriptions", subscriptions.size());
        overview.put("averageMonthlySpending", totalMonthlySpending);
        overview.put("annualProjection", annualProjection);
        overview.put("costPerDay", costPerDay);
        
        return overview;
    }
    
    public Map<String, Object> getSpendingTrend() {
        Map<String, Object> trend = new HashMap<>();
        
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        double[] amounts = {100.0, 110.0, 105.0, 120.0, 130.0, 125.0, 135.0, 140.0, 130.0, 145.0, 150.0, 155.0};
        
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", months[i]);
            monthData.put("total", amounts[i]);
            monthlyData.add(monthData);
        }
        
        trend.put("monthlyData", monthlyData);
        return trend;
    }
    
    public Map<String, Object> getCategoryBreakdown() {
        Map<String, Object> breakdown = new HashMap<>();
        
        List<Map<String, Object>> categories = new ArrayList<>();
        
        Map<String, Object> streaming = new HashMap<>();
        streaming.put("name", "Streaming");
        streaming.put("value", 15.99);
        categories.add(streaming);
        
        Map<String, Object> music = new HashMap<>();
        music.put("name", "Music");
        music.put("value", 9.99);
        categories.add(music);
        
        Map<String, Object> software = new HashMap<>();
        software.put("name", "Software");
        software.put("value", 52.99);
        categories.add(software);
        
        breakdown.put("categories", categories);
        return breakdown;
    }
    
    public Map<String, Object> getBillingCycleAnalysis() {
        Map<String, Object> analysis = new HashMap<>();
        
        List<Map<String, Object>> cycles = new ArrayList<>();
        
        Map<String, Object> monthly = new HashMap<>();
        monthly.put("name", "Monthly");
        monthly.put("value", 2);
        cycles.add(monthly);
        
        Map<String, Object> yearly = new HashMap<>();
        yearly.put("name", "Yearly");
        yearly.put("value", 1);
        cycles.add(yearly);
        
        analysis.put("cycles", cycles);
        return analysis;
    }
    
    public Map<String, Object> getTopSubscriptions() {
        Map<String, Object> topSubs = new HashMap<>();
        
        List<Map<String, Object>> subscriptions = new ArrayList<>();
        
        Map<String, Object> adobe = new HashMap<>();
        adobe.put("name", "Adobe Creative Cloud");
        adobe.put("amount", 52.99);
        subscriptions.add(adobe);
        
        Map<String, Object> netflix = new HashMap<>();
        netflix.put("name", "Netflix Premium");
        netflix.put("amount", 15.99);
        subscriptions.add(netflix);
        
        Map<String, Object> spotify = new HashMap<>();
        spotify.put("name", "Spotify Premium");
        spotify.put("amount", 9.99);
        subscriptions.add(spotify);
        
        topSubs.put("subscriptions", subscriptions);
        return topSubs;
    }
    
    public Map<String, Object> getProjections() {
        Map<String, Object> result = new HashMap<>();
        result.put("annualProjection", 1391.40);
        result.put("monthlyProjection", 115.95);
        result.put("trend", "increasing");
        return result;
    }
    
    public Map<String, Object> getInsights() {
        Map<String, Object> result = new HashMap<>();
        result.put("insights", List.of(
            "Your subscription spending has increased by 15% this month",
            "Consider reviewing your Adobe Creative Cloud usage",
            "You have 2 subscriptions renewing in the next week"
        ));
        return result;
    }
    
    public Map<String, Object> compareSubscriptions(List<String> subscriptionIds) {
        Map<String, Object> result = new HashMap<>();
        result.put("comparison", "Mock comparison data for subscriptions: " + subscriptionIds);
        return result;
    }
}
