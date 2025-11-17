package com.subsentry.model;

import java.time.LocalDateTime;
import java.util.Map;

public class ScheduledReport {

    private String id;
    private String userId;
    private String name;
    private String frequency;
    private int dayOfPeriod;
    private boolean emailDelivery;
    private String reportId;
    private String type;
    private Map<String, Object> filters;
    private LocalDateTime nextRun;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ScheduledReport() {
        this.frequency = "monthly";
        this.dayOfPeriod = 1;
        this.emailDelivery = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public int getDayOfPeriod() {
        return dayOfPeriod;
    }

    public void setDayOfPeriod(int dayOfPeriod) {
        this.dayOfPeriod = dayOfPeriod;
    }

    public boolean isEmailDelivery() {
        return emailDelivery;
    }

    public void setEmailDelivery(boolean emailDelivery) {
        this.emailDelivery = emailDelivery;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getFilters() {
        return filters;
    }

    public void setFilters(Map<String, Object> filters) {
        this.filters = filters;
    }

    public LocalDateTime getNextRun() {
        return nextRun;
    }

    public void setNextRun(LocalDateTime nextRun) {
        this.nextRun = nextRun;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

