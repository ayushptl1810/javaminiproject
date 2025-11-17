package com.subsentry.service;

import com.subsentry.dao.SubscriptionDAO;
import com.subsentry.model.Subscription;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Service
public class SubscriptionService {

    private final SubscriptionDAO subscriptionDAO;

    public SubscriptionService(SubscriptionDAO subscriptionDAO) {
        this.subscriptionDAO = subscriptionDAO;
    }

    public List<Subscription> getAllSubscriptions(String userId, String category, String search) {
        return subscriptionDAO.findAll(userId, category, search);
    }

    public List<Subscription> getUpcomingSubscriptions(String userId, int days) {
        return subscriptionDAO.findUpcoming(userId, days);
    }

    public Subscription getSubscriptionById(String userId, String id) {
        return subscriptionDAO.findById(userId, id).orElse(null);
    }

    public Subscription createSubscription(String userId, Subscription subscription) {
        subscription.setUserId(userId);
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        ensureDefaults(subscription);
        return subscriptionDAO.create(subscription);
    }

    public Subscription updateSubscription(String userId, String id, Subscription subscription) {
        subscription.setUserId(userId);
        ensureDefaults(subscription);
        return subscriptionDAO.update(userId, id, subscription);
    }

    public void deleteSubscription(String userId, String id) {
        subscriptionDAO.delete(userId, id);
    }

    public void bulkUpdateSubscriptions(String userId, Map<String, Object> updates) {
        // Placeholder for future bulk update logic driven by DB queries
        System.out.println("Bulk update requested for user " + userId + ": " + updates);
    }

    public void bulkDeleteSubscriptions(String userId, List<String> ids) {
        subscriptionDAO.bulkDelete(userId, ids);
    }

    public int importSubscriptions(String userId, MultipartFile file) {
        return subscriptionDAO.importSubscriptions(userId, file);
    }

    public String exportSubscriptions(String userId, String format, String category) {
        return subscriptionDAO.export(userId, format, category);
    }

    public List<Subscription> getSubscriptionsByDateRange(String userId, String startDate, String endDate) {
        LocalDateTime start = parseDate(startDate);
        LocalDateTime end = parseDate(endDate);
        return subscriptionDAO.findByDateRange(userId, start, end);
    }

    private LocalDateTime parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(value, java.time.format.DateTimeFormatter.ISO_DATE_TIME);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.ofInstant(java.time.Instant.parse(value), java.time.ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
        }
        return null;
    }

    private void ensureDefaults(Subscription subscription) {
        if (subscription.getStatus() == null) {
            subscription.setStatus("active");
        }
        if (subscription.getCurrency() == null) {
            subscription.setCurrency("USD");
        }
        if (subscription.getBillingCycle() == null) {
            subscription.setBillingCycle("monthly");
        }
        if (subscription.getCreatedAt() == null) {
            subscription.setCreatedAt(LocalDateTime.now());
        }
        if (subscription.getUpdatedAt() == null) {
            subscription.setUpdatedAt(LocalDateTime.now());
        }
    }
}
