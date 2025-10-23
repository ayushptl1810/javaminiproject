package com.subsentry.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReportService {
    
    private List<Map<String, Object>> mockReports = new ArrayList<>();
    
    public Map<String, Object> getReports() {
        Map<String, Object> result = new HashMap<>();
        result.put("reports", mockReports);
        return result;
    }
    
    public Map<String, Object> generateReport(Map<String, Object> reportData) {
        Map<String, Object> report = new HashMap<>();
        report.put("id", "report-" + System.currentTimeMillis());
        report.put("name", reportData.getOrDefault("name", "Generated Report"));
        report.put("type", reportData.getOrDefault("type", "summary"));
        report.put("status", "completed");
        report.put("createdAt", LocalDateTime.now());
        report.put("data", "Mock report content");
        
        mockReports.add(report);
        return report;
    }
    
    public Map<String, Object> getScheduledReports() {
        Map<String, Object> result = new HashMap<>();
        result.put("reports", new ArrayList<>()); // Empty for now
        return result;
    }
    
    public void deleteReport(String id) {
        mockReports.removeIf(report -> report.get("id").equals(id));
    }
    
    public Map<String, Object> getTemplates() {
        Map<String, Object> result = new HashMap<>();
        result.put("templates", List.of(
            Map.of("id", "template-1", "name", "Monthly Summary", "type", "summary"),
            Map.of("id", "template-2", "name", "Annual Report", "type", "annual"),
            Map.of("id", "template-3", "name", "Category Breakdown", "type", "category")
        ));
        return result;
    }
    
    public Map<String, Object> getReport(String id) {
        return mockReports.stream()
                .filter(report -> report.get("id").equals(id))
                .findFirst()
                .orElse(Map.of("id", id, "name", "Report Not Found"));
    }
    
    public String downloadReport(String id, String format) {
        return "Mock report download data for report " + id + " in format " + format;
    }
    
    public void scheduleReport(Map<String, Object> scheduleData) {
        System.out.println("Scheduling report: " + scheduleData);
    }
    
    public void updateSchedule(String id, Map<String, Object> scheduleData) {
        System.out.println("Updating schedule for report " + id + ": " + scheduleData);
    }
    
    public void deleteSchedule(String id) {
        System.out.println("Deleting schedule for report: " + id);
    }
}
