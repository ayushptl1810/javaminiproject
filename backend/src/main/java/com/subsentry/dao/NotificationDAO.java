package com.subsentry.dao;

import com.subsentry.model.Notification;
import com.subsentry.util.DatabaseConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class NotificationDAO {

    public List<Notification> findByUserId(String userId) {
        String sql = """
                SELECT * FROM notifications
                WHERE user_id = ?
                ORDER BY created_at DESC
                """;
        List<Notification> notifications = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    notifications.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to load notifications", e);
        }
        return notifications;
    }

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            notification.setId(UUID.randomUUID().toString());
        }
        notification.setCreatedAt(LocalDateTime.now());

        String sql = """
                INSERT INTO notifications (id, user_id, type, title, message, read_flag, action_link, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, notification.getId());
            ps.setString(2, notification.getUserId());
            ps.setString(3, notification.getType());
            ps.setString(4, notification.getTitle());
            ps.setString(5, notification.getMessage());
            ps.setBoolean(6, notification.isRead());
            ps.setString(7, notification.getActionLink());
            ps.setTimestamp(8, Timestamp.valueOf(notification.getCreatedAt()));
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to save notification", e);
        }
        return notification;
    }

    public void markAsRead(String userId, String notificationId) {
        String sql = "UPDATE notifications SET read_flag = 1 WHERE user_id = ? AND id = ?";
        executeUpdate(sql, ps -> {
            ps.setString(1, userId);
            ps.setString(2, notificationId);
        });
    }

    public void markAllAsRead(String userId) {
        String sql = "UPDATE notifications SET read_flag = 1 WHERE user_id = ?";
        executeUpdate(sql, ps -> ps.setString(1, userId));
    }

    public void delete(String userId, String notificationId) {
        String sql = "DELETE FROM notifications WHERE user_id = ? AND id = ?";
        executeUpdate(sql, ps -> {
            ps.setString(1, userId);
            ps.setString(2, notificationId);
        });
    }

    private Notification mapRow(ResultSet rs) throws SQLException {
        Notification notification = new Notification();
        notification.setId(rs.getString("id"));
        notification.setUserId(rs.getString("user_id"));
        notification.setType(rs.getString("type"));
        notification.setTitle(rs.getString("title"));
        notification.setMessage(rs.getString("message"));
        notification.setRead(rs.getBoolean("read_flag"));
        notification.setActionLink(rs.getString("action_link"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        notification.setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null);
        return notification;
    }

    private void executeUpdate(String sql, SQLConsumer<PreparedStatement> binder) {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            binder.accept(ps);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to execute notification update", e);
        }
    }

    @FunctionalInterface
    private interface SQLConsumer<T> {
        void accept(T t) throws SQLException;
    }
}

