package com.subsentry.dao;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsentry.model.ScheduledReport;
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
public class ScheduledReportDAO {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ScheduledReport> findByUserId(String userId) {
        String sql = """
                SELECT * FROM scheduled_reports
                WHERE user_id = ?
                ORDER BY created_at DESC
                """;
        List<ScheduledReport> schedules = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    schedules.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to load scheduled reports", e);
        }
        return schedules;
    }

    public Optional<ScheduledReport> findById(String userId, String id) {
        String sql = "SELECT * FROM scheduled_reports WHERE user_id = ? AND id = ?";
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
            throw new IllegalStateException("Failed to load schedule", e);
        }
        return Optional.empty();
    }

    public ScheduledReport save(ScheduledReport schedule) {
        if (schedule.getId() == null) {
            schedule.setId(UUID.randomUUID().toString());
            schedule.setCreatedAt(LocalDateTime.now());
        }
        schedule.setUpdatedAt(LocalDateTime.now());

        String sql = """
                INSERT INTO scheduled_reports (
                    id, user_id, name, frequency, day_of_period, email_delivery, report_type,
                    filters, next_run, created_at, updated_at, report_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?, ?)
                """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            bind(ps, schedule);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to save schedule", e);
        }
        return schedule;
    }

    public ScheduledReport update(ScheduledReport schedule) {
        schedule.setUpdatedAt(LocalDateTime.now());

        String sql = """
                UPDATE scheduled_reports SET
                    name = ?, frequency = ?, day_of_period = ?, email_delivery = ?,
                    report_type = ?, filters = CAST(? AS JSON), next_run = ?, updated_at = ?, report_id = ?
                WHERE id = ? AND user_id = ?
                """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            int i = 1;
            ps.setString(i++, schedule.getName());
            ps.setString(i++, schedule.getFrequency());
            ps.setInt(i++, schedule.getDayOfPeriod());
            ps.setBoolean(i++, schedule.isEmailDelivery());
            ps.setString(i++, schedule.getType());
            ps.setString(i++, writeJson(schedule.getFilters()));
            setTimestamp(ps, i++, schedule.getNextRun());
            setTimestamp(ps, i++, schedule.getUpdatedAt());
            ps.setString(i++, schedule.getReportId());
            ps.setString(i++, schedule.getId());
            ps.setString(i, schedule.getUserId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to update schedule", e);
        }

        return schedule;
    }

    public void delete(String userId, String id) {
        String sql = "DELETE FROM scheduled_reports WHERE user_id = ? AND id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            ps.setString(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to delete schedule", e);
        }
    }

    private void bind(PreparedStatement ps, ScheduledReport schedule) throws SQLException {
        int i = 1;
        ps.setString(i++, schedule.getId());
        ps.setString(i++, schedule.getUserId());
        ps.setString(i++, schedule.getName());
        ps.setString(i++, schedule.getFrequency());
        ps.setInt(i++, schedule.getDayOfPeriod());
        ps.setBoolean(i++, schedule.isEmailDelivery());
        ps.setString(i++, schedule.getType());
        ps.setString(i++, writeJson(schedule.getFilters()));
        setTimestamp(ps, i++, schedule.getNextRun());
        setTimestamp(ps, i++, schedule.getCreatedAt());
        setTimestamp(ps, i++, schedule.getUpdatedAt());
        ps.setString(i, schedule.getReportId());
    }

    private ScheduledReport mapRow(ResultSet rs) throws SQLException {
        ScheduledReport schedule = new ScheduledReport();
        schedule.setId(rs.getString("id"));
        schedule.setUserId(rs.getString("user_id"));
        schedule.setName(rs.getString("name"));
        schedule.setFrequency(rs.getString("frequency"));
        schedule.setDayOfPeriod(rs.getInt("day_of_period"));
        schedule.setEmailDelivery(rs.getBoolean("email_delivery"));
        schedule.setType(rs.getString("report_type"));
        schedule.setFilters(readJson(rs.getString("filters")));
        schedule.setNextRun(getDateTime(rs, "next_run"));
        schedule.setCreatedAt(getDateTime(rs, "created_at"));
        schedule.setUpdatedAt(getDateTime(rs, "updated_at"));
        schedule.setReportId(rs.getString("report_id"));
        return schedule;
    }

    private LocalDateTime getDateTime(ResultSet rs, String column) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(column);
        return timestamp != null ? timestamp.toLocalDateTime() : null;
    }

    private void setTimestamp(PreparedStatement ps, int index, LocalDateTime value) throws SQLException {
        if (value == null) {
            ps.setNull(index, Types.TIMESTAMP);
        } else {
            ps.setTimestamp(index, Timestamp.valueOf(value));
        }
    }

    private Map<String, Object> readJson(String value) {
        if (value == null || value.isBlank()) {
            return Map.of();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(value, Map.class);
            return map;
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to parse schedule JSON", e);
        }
    }

    private String writeJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map == null ? Map.of() : map);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize schedule JSON", e);
        }
    }
}

