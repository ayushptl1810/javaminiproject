package com.subsentry.dao;

import com.subsentry.model.Subscription;
import com.subsentry.util.DatabaseConnection;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class SubscriptionDAO {

    public List<Subscription> findAll(String userId, String category, String search) {
        StringBuilder sql = new StringBuilder("SELECT * FROM subscriptions WHERE user_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (category != null && !category.isBlank()) {
            sql.append(" AND LOWER(category) LIKE ?");
            params.add("%" + category.toLowerCase() + "%");
        }

        if (search != null && !search.isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + search.toLowerCase() + "%");
        }

        sql.append(" ORDER BY created_at DESC");
        return query(sql.toString(), params);
    }

    public List<Subscription> findUpcoming(String userId, int days) {
        String sql = """
                SELECT * FROM subscriptions
                WHERE user_id = ?
                  AND next_renewal_date IS NOT NULL
                  AND next_renewal_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
                ORDER BY next_renewal_date ASC
                """;
        return query(sql, List.of(userId, days));
    }

    public Optional<Subscription> findById(String userId, String id) {
        String sql = "SELECT * FROM subscriptions WHERE user_id = ? AND id = ?";
        List<Subscription> results = query(sql, List.of(userId, id));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Subscription create(Subscription subscription) {
        subscription.setId(UUID.randomUUID().toString());
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());

        String sql = """
                INSERT INTO subscriptions (
                    id, user_id, name, amount, currency, category, billing_cycle, start_date,
                    next_renewal_date, status, auto_renewal, payment_method, portal_link, notes,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        execute(sql, ps -> bindSubscription(ps, subscription, true));
        return subscription;
    }

    public Subscription update(String userId, String id, Subscription subscription) {
        subscription.setUpdatedAt(LocalDateTime.now());
        subscription.setId(id);
        subscription.setUserId(userId);

        String sql = """
                UPDATE subscriptions SET
                    name = ?, amount = ?, currency = ?, category = ?, billing_cycle = ?, start_date = ?,
                    next_renewal_date = ?, status = ?, auto_renewal = ?, payment_method = ?, portal_link = ?,
                    notes = ?, updated_at = ?
                WHERE id = ? AND user_id = ?
                """;

        execute(sql, ps -> {
            int i = 1;
            ps.setString(i++, subscription.getName());
            ps.setBigDecimal(i++, java.math.BigDecimal.valueOf(subscription.getAmount()));
            ps.setString(i++, subscription.getCurrency());
            ps.setString(i++, subscription.getCategory());
            ps.setString(i++, subscription.getBillingCycle());
            setTimestamp(ps, i++, subscription.getStartDate());
            setTimestamp(ps, i++, subscription.getNextRenewalDate());
            ps.setString(i++, subscription.getStatus());
            ps.setBoolean(i++, subscription.isAutoRenewal());
            ps.setString(i++, subscription.getPaymentMethod());
            ps.setString(i++, subscription.getPortalLink());
            ps.setString(i++, subscription.getNotes());
            setTimestamp(ps, i++, subscription.getUpdatedAt());
            ps.setString(i++, id);
            ps.setString(i, userId);
        });
        return subscription;
    }

    public void delete(String userId, String id) {
        String sql = "DELETE FROM subscriptions WHERE user_id = ? AND id = ?";
        execute(sql, ps -> {
            ps.setString(1, userId);
            ps.setString(2, id);
        });
    }

    public void bulkDelete(String userId, List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        String inClause = ids.stream().map(id -> "?").collect(Collectors.joining(","));
        String sql = "DELETE FROM subscriptions WHERE user_id = ? AND id IN (" + inClause + ")";
        execute(sql, ps -> {
            ps.setString(1, userId);
            int index = 2;
            for (String id : ids) {
                ps.setString(index++, id);
            }
        });
    }

    public List<Subscription> findByDateRange(String userId, LocalDateTime start, LocalDateTime end) {
        StringBuilder sql = new StringBuilder("SELECT * FROM subscriptions WHERE user_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (start != null) {
            sql.append(" AND start_date >= ?");
            params.add(Timestamp.valueOf(start));
        }
        if (end != null) {
            sql.append(" AND start_date <= ?");
            params.add(Timestamp.valueOf(end));
        }

        sql.append(" ORDER BY start_date DESC");
        return query(sql.toString(), params);
    }

    public int importSubscriptions(String userId, MultipartFile file) {
        throw new UnsupportedOperationException("File import is not implemented yet");
    }

    public String export(String userId, String format, String category) {
        throw new UnsupportedOperationException("Exporting subscriptions is not implemented yet");
    }

    private void bindSubscription(PreparedStatement ps, Subscription subscription, boolean includeIdentifiers) throws SQLException {
        int i = 1;
        if (includeIdentifiers) {
            ps.setString(i++, subscription.getId());
            ps.setString(i++, subscription.getUserId());
        }
        ps.setString(i++, subscription.getName());
        ps.setBigDecimal(i++, java.math.BigDecimal.valueOf(subscription.getAmount()));
        ps.setString(i++, subscription.getCurrency());
        ps.setString(i++, subscription.getCategory());
        ps.setString(i++, subscription.getBillingCycle());
        setTimestamp(ps, i++, subscription.getStartDate());
        setTimestamp(ps, i++, subscription.getNextRenewalDate());
        ps.setString(i++, subscription.getStatus());
        ps.setBoolean(i++, subscription.isAutoRenewal());
        ps.setString(i++, subscription.getPaymentMethod());
        ps.setString(i++, subscription.getPortalLink());
        ps.setString(i++, subscription.getNotes());
        setTimestamp(ps, i++, subscription.getCreatedAt());
        setTimestamp(ps, i, subscription.getUpdatedAt());
    }

    private List<Subscription> query(String sql, List<Object> params) {
        List<Subscription> subscriptions = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            bindParams(ps, params);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    subscriptions.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to execute subscription query", e);
        }
        return subscriptions;
    }

    private void execute(String sql, SQLConsumer<PreparedStatement> binder) {
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            binder.accept(ps);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to execute subscription statement", e);
        }
    }

    private void bindParams(PreparedStatement ps, List<Object> params) throws SQLException {
        if (params == null) {
            return;
        }
        for (int i = 0; i < params.size(); i++) {
            Object value = params.get(i);
            if (value instanceof Timestamp timestamp) {
                ps.setTimestamp(i + 1, timestamp);
            } else if (value instanceof Integer integer) {
                ps.setInt(i + 1, integer);
            } else {
                ps.setObject(i + 1, value);
            }
        }
    }

    private Subscription mapRow(ResultSet rs) throws SQLException {
        Subscription subscription = new Subscription();
        subscription.setId(rs.getString("id"));
        subscription.setUserId(rs.getString("user_id"));
        subscription.setName(rs.getString("name"));
        subscription.setAmount(rs.getBigDecimal("amount").doubleValue());
        subscription.setCurrency(rs.getString("currency"));
        subscription.setCategory(rs.getString("category"));
        subscription.setBillingCycle(rs.getString("billing_cycle"));
        subscription.setStartDate(getDateTime(rs, "start_date"));
        subscription.setNextRenewalDate(getDateTime(rs, "next_renewal_date"));
        subscription.setStatus(rs.getString("status"));
        subscription.setAutoRenewal(rs.getBoolean("auto_renewal"));
        subscription.setPaymentMethod(rs.getString("payment_method"));
        subscription.setPortalLink(rs.getString("portal_link"));
        subscription.setNotes(rs.getString("notes"));
        subscription.setCreatedAt(getDateTime(rs, "created_at"));
        subscription.setUpdatedAt(getDateTime(rs, "updated_at"));
        return subscription;
    }

    private LocalDateTime getDateTime(ResultSet rs, String column) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(column);
        return timestamp != null ? timestamp.toLocalDateTime() : null;
    }

    private void setTimestamp(PreparedStatement ps, int index, LocalDateTime dateTime) throws SQLException {
        if (dateTime == null) {
            ps.setNull(index, Types.TIMESTAMP);
        } else {
            ps.setTimestamp(index, Timestamp.valueOf(dateTime));
        }
    }

    @FunctionalInterface
    private interface SQLConsumer<T> {
        void accept(T t) throws SQLException;
    }
}

