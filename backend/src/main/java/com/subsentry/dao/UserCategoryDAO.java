package com.subsentry.dao;

import com.subsentry.util.DatabaseConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class UserCategoryDAO {

    public List<CategoryRecord> findByUserId(String userId) {
        String sql = "SELECT id, name FROM user_categories WHERE user_id = ? ORDER BY name ASC";
        List<CategoryRecord> categories = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    categories.add(new CategoryRecord(rs.getString("id"), rs.getString("name")));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to load categories", e);
        }
        return categories;
    }

    public CategoryRecord addCategory(String userId, String name) {
        String sql = """
                INSERT INTO user_categories (id, user_id, name, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """;
        CategoryRecord record = new CategoryRecord(UUID.randomUUID().toString(), name);
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, record.id());
            ps.setString(2, userId);
            ps.setString(3, name);
            Timestamp now = Timestamp.valueOf(LocalDateTime.now());
            ps.setTimestamp(4, now);
            ps.setTimestamp(5, now);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to add category", e);
        }
        return record;
    }

    public void updateCategory(String userId, String categoryId, String name) {
        String sql = "UPDATE user_categories SET name = ?, updated_at = ? WHERE user_id = ? AND id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            ps.setString(3, userId);
            ps.setString(4, categoryId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to update category", e);
        }
    }

    public void deleteCategory(String userId, String categoryId) {
        String sql = "DELETE FROM user_categories WHERE user_id = ? AND id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            ps.setString(2, categoryId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to delete category", e);
        }
    }

    public record CategoryRecord(String id, String name) {}
}

