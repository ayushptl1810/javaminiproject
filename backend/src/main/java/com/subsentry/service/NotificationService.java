package com.subsentry.service;

import com.subsentry.dao.NotificationDAO;
import com.subsentry.dao.UserDAO;
import com.subsentry.model.Notification;
import com.subsentry.model.User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationDAO notificationDAO;
    private final UserDAO userDAO;

    public NotificationService(NotificationDAO notificationDAO, UserDAO userDAO) {
        this.notificationDAO = notificationDAO;
        this.userDAO = userDAO;
    }

    public List<Notification> getNotifications(String userId) {
        return notificationDAO.findByUserId(userId);
    }

    public void markAsRead(String userId, String id) {
        notificationDAO.markAsRead(userId, id);
    }

    public void markAllAsRead(String userId) {
        notificationDAO.markAllAsRead(userId);
    }

    public void deleteNotification(String userId, String id) {
        notificationDAO.delete(userId, id);
    }

    public void updatePreferences(String userId, Map<String, Object> preferences) {
        User user = userDAO.getUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        boolean emailNotifications = getBoolean(preferences.get("emailNotifications"), true);
        boolean browserNotifications = getBoolean(preferences.get("browserNotifications"), true);
        boolean renewalReminders = getBoolean(preferences.get("renewalReminders"), true);
        boolean weeklySummary = getBoolean(preferences.get("weeklySummary"), false);

        user.setEmailNotifications(emailNotifications);
        user.setBrowserNotifications(browserNotifications);
        user.setRenewalReminders(renewalReminders);
        user.setWeeklySummary(weeklySummary);

        userDAO.updateUserSettings(user);
    }

    public Map<String, Object> getPreferences(String userId) {
        User user = userDAO.getUserById(userId);
        Map<String, Object> preferences = new HashMap<>();
        if (user != null) {
            preferences.put("emailNotifications", user.isEmailNotifications());
            preferences.put("browserNotifications", user.isBrowserNotifications());
            preferences.put("renewalReminders", user.isRenewalReminders());
            preferences.put("weeklySummary", user.isWeeklySummary());
            preferences.put("reminderDays", 2);
        } else {
            preferences.put("emailNotifications", true);
            preferences.put("browserNotifications", true);
            preferences.put("renewalReminders", true);
            preferences.put("weeklySummary", false);
            preferences.put("reminderDays", 2);
        }
        return preferences;
    }

    public void testNotification(String userId, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type != null ? type : "info");
        notification.setTitle("Test Notification");
        notification.setMessage("Notifications are configured correctly.");
        notification.setRead(false);
        notificationDAO.save(notification);
    }

    private boolean getBoolean(Object value, boolean defaultValue) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof String stringValue) {
            return Boolean.parseBoolean(stringValue);
        }
        return defaultValue;
    }
}
