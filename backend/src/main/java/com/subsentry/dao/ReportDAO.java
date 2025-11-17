package com.subsentry.dao;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsentry.model.GeneratedReport;
import com.subsentry.util.DatabaseConnection;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ReportDAO {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<GeneratedReport> findByUserId(String userId) {
        String sql = """
                SELECT * FROM generated_reports
                WHERE user_id = ?
                ORDER BY created_at DESC
                """;
        List<GeneratedReport> reports = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    reports.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to load reports", e);
        }
        return reports;
    }

    public Optional<GeneratedReport> findById(String userId, String id) {
        String sql = "SELECT * FROM generated_reports WHERE user_id = ? AND id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            ps.setString(2, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to load report", e);
        }
        return Optional.empty();
    }

    public GeneratedReport save(GeneratedReport report) {
        if (report.getId() == null) {
            report.setId(UUID.randomUUID().toString());
        }
        report.setCreatedAt(LocalDateTime.now());

        String sql = """
                INSERT INTO generated_reports (
                    id, user_id, name, type, format, status, filters, content, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?)
                """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, report.getId());
            ps.setString(2, report.getUserId());
            ps.setString(3, report.getName());
            ps.setString(4, report.getType());
            ps.setString(5, report.getFormat());
            ps.setString(6, report.getStatus());
            ps.setString(7, writeJson(report.getFilters()));
            ps.setString(8, writeJson(report.getContent()));
            ps.setTimestamp(9, Timestamp.valueOf(report.getCreatedAt()));
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to save report", e);
        }

        return report;
    }

    public void delete(String userId, String id) {
        String sql = "DELETE FROM generated_reports WHERE user_id = ? AND id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            ps.setString(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to delete report", e);
        }
    }

    private GeneratedReport mapRow(ResultSet rs) throws SQLException {
        GeneratedReport report = new GeneratedReport();
        report.setId(rs.getString("id"));
        report.setUserId(rs.getString("user_id"));
        report.setName(rs.getString("name"));
        report.setType(rs.getString("type"));
        report.setFormat(rs.getString("format"));
        report.setStatus(rs.getString("status"));
        report.setFilters(readJson(rs.getString("filters")));
        report.setContent(readJson(rs.getString("content")));
        Timestamp createdAt = rs.getTimestamp("created_at");
        report.setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null);
        return report;
    }

    private Map<String, Object> readJson(String value) {
        if (value == null || value.isBlank()) {
            return Map.of();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(value, Map.class);
            return data;
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to parse JSON column", e);
        }
    }

    private String writeJson(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Map.of() : value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize JSON column", e);
        }
    }
}

