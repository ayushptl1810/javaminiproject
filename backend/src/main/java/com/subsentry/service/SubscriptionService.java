package com.subsentry.service;

import com.subsentry.model.Subscription;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {
    
    // Mock data for demo
    private List<Subscription> mockSubscriptions = new ArrayList<>();
    
    public SubscriptionService() {
        initializeMockData();
    }
    
    private void initializeMockData() {
        Subscription sub1 = new Subscription();
        sub1.setId("sub-1");
        sub1.setName("Netflix Premium");
        sub1.setAmount(15.99);
        sub1.setCategory("Streaming");
        sub1.setBillingCycle("monthly");
        sub1.setStartDate(LocalDateTime.now().minusDays(30));
        sub1.setNextRenewalDate(LocalDateTime.now().plusDays(5));
        sub1.setAutoRenewal(true);
        sub1.setNotes("Premium plan with 4K streaming");
        sub1.setPaymentMethod("Credit Card ending in 1234");
        sub1.setPortalLink("https://netflix.com/account");
        mockSubscriptions.add(sub1);
        
        Subscription sub2 = new Subscription();
        sub2.setId("sub-2");
        sub2.setName("Spotify Premium");
        sub2.setAmount(9.99);
        sub2.setCategory("Music");
        sub2.setBillingCycle("monthly");
        sub2.setStartDate(LocalDateTime.now().minusDays(15));
        sub2.setNextRenewalDate(LocalDateTime.now().plusDays(2));
        sub2.setAutoRenewal(true);
        sub2.setNotes("Student discount");
        sub2.setPaymentMethod("PayPal");
        sub2.setPortalLink("https://spotify.com/account");
        mockSubscriptions.add(sub2);
        
        Subscription sub3 = new Subscription();
        sub3.setId("sub-3");
        sub3.setName("Adobe Creative Cloud");
        sub3.setAmount(52.99);
        sub3.setCategory("Software");
        sub3.setBillingCycle("monthly");
        sub3.setStartDate(LocalDateTime.now().minusDays(60));
        sub3.setNextRenewalDate(LocalDateTime.now().plusDays(15));
        sub3.setAutoRenewal(true);
        sub3.setNotes("All apps plan");
        sub3.setPaymentMethod("Credit Card ending in 5678");
        sub3.setPortalLink("https://adobe.com/account");
        mockSubscriptions.add(sub3);
    }
    
    public List<Subscription> getAllSubscriptions(String category, String search) {
        List<Subscription> result = new ArrayList<>(mockSubscriptions);
        
        if (category != null && !category.isEmpty()) {
            result = result.stream()
                    .filter(sub -> sub.getCategory().toLowerCase().contains(category.toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            result = result.stream()
                    .filter(sub -> sub.getName().toLowerCase().contains(search.toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        return result;
    }
    
    public List<Subscription> getUpcomingSubscriptions(int days) {
        LocalDateTime futureDate = LocalDateTime.now().plusDays(days);
        return mockSubscriptions.stream()
                .filter(sub -> sub.getNextRenewalDate().isBefore(futureDate) && sub.getNextRenewalDate().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
    }
    
    public Subscription getSubscriptionById(String id) {
        return mockSubscriptions.stream()
                .filter(sub -> sub.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
    
    public Subscription createSubscription(Subscription subscription) {
        subscription.setId("sub-" + System.currentTimeMillis());
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        mockSubscriptions.add(subscription);
        return subscription;
    }
    
    public Subscription updateSubscription(String id, Subscription subscription) {
        for (int i = 0; i < mockSubscriptions.size(); i++) {
            if (mockSubscriptions.get(i).getId().equals(id)) {
                subscription.setId(id);
                subscription.setUpdatedAt(LocalDateTime.now());
                mockSubscriptions.set(i, subscription);
                return subscription;
            }
        }
        return null;
    }
    
    public void deleteSubscription(String id) {
        mockSubscriptions.removeIf(sub -> sub.getId().equals(id));
    }
    
    public void bulkUpdateSubscriptions(Map<String, Object> updates) {
        // Mock implementation for bulk updates
        System.out.println("Bulk update requested: " + updates);
    }
    
    public void bulkDeleteSubscriptions(List<String> ids) {
        mockSubscriptions.removeIf(sub -> ids.contains(sub.getId()));
    }
    
    public int importSubscriptions(org.springframework.web.multipart.MultipartFile file) {
        // Mock implementation for file import
        return 5; // Mock: imported 5 subscriptions
    }
    
    public String exportSubscriptions(String format, String category) {
        // Mock implementation for export
        return "Mock CSV export data";
    }
    
    public List<Subscription> getSubscriptionsByDateRange(String startDate, String endDate) {
        // Mock implementation for date range filtering
        return mockSubscriptions.stream()
                .filter(sub -> {
                    // Simple mock filtering - in real implementation would check actual dates
                    return true;
                })
                .collect(Collectors.toList());
    }
}
