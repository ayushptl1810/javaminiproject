package com.subsentry.service;

import com.subsentry.dao.UserCategoryDAO;
import com.subsentry.dao.UserDAO;
import com.subsentry.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SettingsService {

    private final UserDAO userDAO;
    private final UserCategoryDAO userCategoryDAO;
    private final SubscriptionService subscriptionService;

    public SettingsService(UserDAO userDAO,
                           UserCategoryDAO userCategoryDAO,
                           SubscriptionService subscriptionService) {
        this.userDAO = userDAO;
        this.userCategoryDAO = userCategoryDAO;
        this.subscriptionService = subscriptionService;
    }

    public Map<String, Object> getSettings(String userId) {
        User user = userDAO.getUserById(userId);
        if (user == null) {
            return Map.of();
        }
        Map<String, Object> settings = new HashMap<>();
        settings.put("name", user.getName());
        settings.put("defaultCurrency", user.getDefaultCurrency());
        settings.put("timezone", user.getTimezone());
        settings.put("dateFormat", user.getDateFormat());
        settings.put("bio", user.getBio());
        settings.put("location", user.getLocation());
        settings.put("website", user.getWebsite());
        settings.put("avatar", user.getAvatar());
        settings.put("emailNotifications", user.isEmailNotifications());
        settings.put("browserNotifications", user.isBrowserNotifications());
        settings.put("renewalReminders", user.isRenewalReminders());
        settings.put("weeklySummary", user.isWeeklySummary());
        return settings;
    }

    public void updateSettings(String userId, Map<String, Object> settings) {
        User user = userDAO.getUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        if (settings.containsKey("name")) {
            user.setName(String.valueOf(settings.get("name")));
        }
        if (settings.containsKey("defaultCurrency")) {
            user.setDefaultCurrency(String.valueOf(settings.get("defaultCurrency")));
        }
        if (settings.containsKey("timezone")) {
            user.setTimezone(String.valueOf(settings.get("timezone")));
        }
        if (settings.containsKey("dateFormat")) {
            user.setDateFormat(String.valueOf(settings.get("dateFormat")));
        }
        if (settings.containsKey("bio")) {
            user.setBio((String) settings.get("bio"));
        }
        if (settings.containsKey("location")) {
            user.setLocation((String) settings.get("location"));
        }
        if (settings.containsKey("website")) {
            user.setWebsite((String) settings.get("website"));
        }
        if (settings.containsKey("avatar")) {
            user.setAvatar((String) settings.get("avatar"));
        }
        if (settings.containsKey("emailNotifications")) {
            user.setEmailNotifications(parseBoolean(settings.get("emailNotifications")));
        }
        if (settings.containsKey("browserNotifications")) {
            user.setBrowserNotifications(parseBoolean(settings.get("browserNotifications")));
        }
        if (settings.containsKey("renewalReminders")) {
            user.setRenewalReminders(parseBoolean(settings.get("renewalReminders")));
        }
        if (settings.containsKey("weeklySummary")) {
            user.setWeeklySummary(parseBoolean(settings.get("weeklySummary")));
        }
        userDAO.updateUserSettings(user);
    }

    public Map<String, Object> getCategories(String userId) {
        Set<String> categories = new HashSet<>();
        List<String> persisted = userCategoryDAO.findByUserId(userId).stream()
                .map(UserCategoryDAO.CategoryRecord::name)
                .collect(Collectors.toList());
        categories.addAll(persisted);
        subscriptionService.getAllSubscriptions(userId, null, null).stream()
                .map(sub -> sub.getCategory() == null ? "Uncategorized" : sub.getCategory())
                .forEach(categories::add);
        return Map.of(
                "categories", persisted,
                "available", new ArrayList<>(categories)
        );
    }

    public void addCategory(String userId, Map<String, Object> category) {
        String name = (String) category.get("name");
        if (name != null && !name.isBlank()) {
            userCategoryDAO.addCategory(userId, name.trim());
        }
    }

    public void updateCategory(String userId, String id, Map<String, Object> category) {
        String name = (String) category.get("name");
        if (name != null && !name.isBlank()) {
            userCategoryDAO.updateCategory(userId, id, name.trim());
        }
    }

    public void deleteCategory(String userId, String id) {
        userCategoryDAO.deleteCategory(userId, id);
    }

    public Map<String, Object> getCurrencies() {
        return Map.of("currencies", List.of("USD", "EUR", "GBP", "CAD", "AUD", "JPY"));
    }

    public void updateCurrency(String userId, String currency) {
        if (currency == null || currency.isBlank()) {
            return;
        }
        User user = userDAO.getUserById(userId);
        if (user != null) {
            user.setDefaultCurrency(currency);
            userDAO.updateUserSettings(user);
        }
    }

    private boolean parseBoolean(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof String string) {
            return Boolean.parseBoolean(string);
        }
        return false;
    }
}
