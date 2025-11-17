package com.subsentry.dao;

import com.subsentry.model.User;
import com.subsentry.util.DatabaseConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class UserDAO {
    @SuppressWarnings("CallToPrintStackTrace")
    public boolean createUser(User user) {
        String sql = "INSERT INTO users (id, name, email, password, default_currency, timezone) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            user.setId(UUID.randomUUID().toString());
            pstmt.setString(1, user.getId());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getEmail());
            pstmt.setString(4, user.getPassword());
            pstmt.setString(5, user.getDefaultCurrency());
            pstmt.setString(6, user.getTimezone());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @SuppressWarnings("CallToPrintStackTrace")
    public User getUserByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, email);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                User user = new User();
                user.setId(rs.getString("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setPassword(rs.getString("password"));
                user.setDefaultCurrency(rs.getString("default_currency"));
                user.setTimezone(rs.getString("timezone"));
                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @SuppressWarnings("CallToPrintStackTrace")
    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                User user = new User();
                user.setId(rs.getString("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                users.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    @SuppressWarnings("CallToPrintStackTrace")
    public User getUserById(String id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return mapUser(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @SuppressWarnings("CallToPrintStackTrace")
    public boolean updateUserSettings(User user) {
        String sql = """
                UPDATE users SET
                    name = ?, default_currency = ?, timezone = ?, date_format = ?, bio = ?, location = ?,
                    website = ?, avatar = ?, email_notifications = ?, browser_notifications = ?,
                    renewal_reminders = ?, weekly_summary = ?
                WHERE id = ?
                """;
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, user.getName());
            pstmt.setString(2, user.getDefaultCurrency());
            pstmt.setString(3, user.getTimezone());
            pstmt.setString(4, user.getDateFormat());
            pstmt.setString(5, user.getBio());
            pstmt.setString(6, user.getLocation());
            pstmt.setString(7, user.getWebsite());
            pstmt.setString(8, user.getAvatar());
            pstmt.setBoolean(9, user.isEmailNotifications());
            pstmt.setBoolean(10, user.isBrowserNotifications());
            pstmt.setBoolean(11, user.isRenewalReminders());
            pstmt.setBoolean(12, user.isWeeklySummary());
            pstmt.setString(13, user.getId());
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private User mapUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getString("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setDefaultCurrency(rs.getString("default_currency"));
        user.setTimezone(rs.getString("timezone"));
        user.setDateFormat(rs.getString("date_format"));
        user.setBio(rs.getString("bio"));
        user.setLocation(rs.getString("location"));
        user.setWebsite(rs.getString("website"));
        user.setAvatar(rs.getString("avatar"));
        user.setEmailNotifications(rs.getBoolean("email_notifications"));
        user.setBrowserNotifications(rs.getBoolean("browser_notifications"));
        user.setRenewalReminders(rs.getBoolean("renewal_reminders"));
        user.setWeeklySummary(rs.getBoolean("weekly_summary"));
        return user;
    }
}