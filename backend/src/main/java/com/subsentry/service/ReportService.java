package com.subsentry.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Chunk;
import com.lowagie.text.pdf.PdfWriter;
import com.subsentry.model.Subscription;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private final SubscriptionService subscriptionService;
    private final AnalyticsService analyticsService;
    private final List<Map<String, Object>> generatedReports = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> scheduledReports = new CopyOnWriteArrayList<>();

    public ReportService(SubscriptionService subscriptionService, AnalyticsService analyticsService) {
        this.subscriptionService = subscriptionService;
        this.analyticsService = analyticsService;
    }

    public Map<String, Object> getReports() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> orderedReports = new ArrayList<>(generatedReports);
        orderedReports.sort((r1, r2) -> {
            LocalDateTime first = parseDateTime((String) r1.get("createdAt"));
            LocalDateTime second = parseDateTime((String) r2.get("createdAt"));
            return second.compareTo(first);
        });
        result.put("reports", orderedReports);
        return result;
    }

    public Map<String, Object> generateReport(Map<String, Object> reportData) {
        Map<String, Object> filters = extractFilters(reportData);
        List<Subscription> subscriptions = applyFilters(filters);

        String type = String.valueOf(reportData.getOrDefault("type", "summary"));
        Map<String, Object> content = switch (type) {
            case "category" -> buildCategoryBreakdownReport(subscriptions);
            case "annual" -> buildAnnualProjectionReport(subscriptions);
            default -> buildMonthlySummaryReport(subscriptions);
        };

        Map<String, Object> report = new HashMap<>();
        report.put("id", "report-" + System.currentTimeMillis());
        report.put("name", reportData.getOrDefault("name", "Generated Report"));
        report.put("type", type);
        report.put("format", reportData.getOrDefault("format", "pdf"));
        report.put("status", "completed");
        report.put("createdAt", ISO_FORMATTER.format(LocalDateTime.now()));
        report.put("filters", filters);
        report.put("content", content);

        generatedReports.add(0, report);
        if (generatedReports.size() > 50) {
            generatedReports.remove(generatedReports.size() - 1);
        }

        return report;
    }

    public Map<String, Object> getScheduledReports() {
        Map<String, Object> result = new HashMap<>();
        result.put("reports", new ArrayList<>(scheduledReports));
        return result;
    }

    public void deleteReport(String id) {
        generatedReports.removeIf(report -> Objects.equals(report.get("id"), id));
    }

    public Map<String, Object> getTemplates() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> templates = new ArrayList<>();
        templates.add(createTemplate("template-monthly-summary", "Monthly Summary", "summary",
                "Overview of total spend, active subscriptions, and upcoming renewals."));
        templates.add(createTemplate("template-category-breakdown", "Category Breakdown", "category",
                "Spending by category with optimization insights."));
        templates.add(createTemplate("template-trend", "Trend Report", "trend",
                "Historical costs, growth trajectory, and forecasts."));
        templates.add(createTemplate("template-tax", "Tax Ready Export", "tax",
                "Line-item export grouped by vendor for finance teams."));
        result.put("templates", templates);
        return result;
    }

    public Map<String, Object> getReport(String id) {
        return generatedReports.stream()
                .filter(report -> Objects.equals(report.get("id"), id))
                .findFirst()
                .orElse(Map.of("id", id, "status", "not_found"));
    }

    public byte[] downloadReport(String id, String format) {
        Map<String, Object> report = getReport(id);
        if ("pdf".equalsIgnoreCase(format)) {
            try {
                return buildPdfDocument(report);
            } catch (DocumentException | IOException e) {
                throw new RuntimeException("Failed to generate PDF report", e);
            }
        }
        try {
            return OBJECT_MAPPER.writerWithDefaultPrettyPrinter()
                    .writeValueAsBytes(Map.of(
                            "metadata", Map.of(
                                    "id", report.get("id"),
                                    "name", report.get("name"),
                                    "type", report.get("type"),
                                    "format", format,
                                    "createdAt", report.get("createdAt")
                            ),
                            "content", report.get("content")
                    ));
        } catch (JsonProcessingException e) {
            return "{\"error\":\"Report content unavailable\"}".getBytes(StandardCharsets.UTF_8);
        }
    }

    public Map<String, Object> scheduleReport(Map<String, Object> scheduleData) {
        Map<String, Object> schedule = new HashMap<>();
        schedule.put("id", "schedule-" + System.currentTimeMillis());
        schedule.put("name", scheduleData.getOrDefault("name", "Scheduled Report"));
        schedule.put("frequency", scheduleData.getOrDefault("frequency", "monthly"));
        schedule.put("dayOfPeriod", scheduleData.getOrDefault("dayOfPeriod", 1));
        schedule.put("emailDelivery", scheduleData.getOrDefault("emailDelivery", false));
        schedule.put("reportId", scheduleData.get("reportId"));
        schedule.put("type", scheduleData.getOrDefault("type", "summary"));
        schedule.put("filters", scheduleData.getOrDefault("filters", Map.of()));
        schedule.put("nextRun", ISO_FORMATTER.format(calculateNextRun(
                (String) schedule.get("frequency"),
                ((Number) schedule.get("dayOfPeriod")).intValue()
        )));

        scheduledReports.add(schedule);
        return schedule;
    }

    public Map<String, Object> updateSchedule(String id, Map<String, Object> scheduleData) {
        for (Map<String, Object> schedule : scheduledReports) {
            if (Objects.equals(schedule.get("id"), id)) {
                schedule.putAll(scheduleData);
                schedule.put("nextRun", ISO_FORMATTER.format(calculateNextRun(
                        (String) schedule.getOrDefault("frequency", "monthly"),
                        ((Number) schedule.getOrDefault("dayOfPeriod", 1)).intValue()
                )));
                return schedule;
            }
        }
        return Map.of("id", id, "status", "not_found");
    }

    public void deleteSchedule(String id) {
        scheduledReports.removeIf(schedule -> Objects.equals(schedule.get("id"), id));
    }

    private Map<String, Object> extractFilters(Map<String, Object> reportData) {
        Map<String, Object> filters = new HashMap<>();
        if (reportData.containsKey("startDate")) {
            filters.put("startDate", reportData.get("startDate"));
        }
        if (reportData.containsKey("endDate")) {
            filters.put("endDate", reportData.get("endDate"));
        }
        if (reportData.containsKey("categories")) {
            filters.put("categories", reportData.get("categories"));
        }
        if (reportData.containsKey("status")) {
            filters.put("status", reportData.get("status"));
        }
        return filters;
    }

    private List<Subscription> applyFilters(Map<String, Object> filters) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(null, null);

        Object categoriesObj = filters.get("categories");
        if (categoriesObj instanceof List<?> categories && !categories.isEmpty()) {
            subscriptions = subscriptions.stream()
                    .filter(sub -> categories.stream()
                            .anyMatch(category -> category.toString().equalsIgnoreCase(
                                    Optional.ofNullable(sub.getCategory()).orElse("")
                            )))
                    .collect(Collectors.toList());
        }

        if (filters.get("startDate") instanceof String startDateStr) {
            LocalDateTime start = parseDateTime(startDateStr);
            subscriptions = subscriptions.stream()
                    .filter(sub -> sub.getStartDate() == null || !sub.getStartDate().isBefore(start))
                    .collect(Collectors.toList());
        }

        if (filters.get("endDate") instanceof String endDateStr) {
            LocalDateTime end = parseDateTime(endDateStr);
            subscriptions = subscriptions.stream()
                    .filter(sub -> sub.getStartDate() == null || !sub.getStartDate().isAfter(end))
                    .collect(Collectors.toList());
        }

        if (filters.get("status") instanceof String status && !status.isBlank()) {
            subscriptions = subscriptions.stream()
                    .filter(sub -> status.equalsIgnoreCase(
                            Optional.ofNullable(sub.getStatus()).orElse("active")
                    ))
                    .collect(Collectors.toList());
        }

        return subscriptions;
    }

    private Map<String, Object> buildMonthlySummaryReport(List<Subscription> subscriptions) {
        Map<String, Object> summary = buildSummaryMetrics(subscriptions);
        Map<String, Object> overview = analyticsService.getOverview();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("headlineMetrics", summary);
        result.put("dailyCost", Map.of(
                "costPerDay", summary.getOrDefault("costPerDay", 0),
                "currency", summary.getOrDefault("currency", "USD")
        ));
        result.put("topInsights", buildInsights(subscriptions, summary, overview));
        result.put("upcomingRenewals", buildUpcomingRenewals(subscriptions));
        return result;
    }

    private Map<String, Object> buildCategoryBreakdownReport(List<Subscription> subscriptions) {
        List<Map<String, Object>> breakdown = buildCategoryBreakdown(subscriptions);
        List<Map<String, Object>> topVendors = subscriptions.stream()
                .sorted(Comparator.comparingDouble(Subscription::getAmount).reversed())
                .limit(5)
                .map(sub -> {
                    Map<String, Object> vendor = new HashMap<>();
                    vendor.put("name", sub.getName());
                    vendor.put("category", Optional.ofNullable(sub.getCategory()).orElse("Uncategorized"));
                    vendor.put("amount", round(sub.getAmount()));
                    return vendor;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("categoryTotals", breakdown);
        result.put("topVendors", topVendors);
        result.put("optimizationSuggestions", buildCategorySuggestions(breakdown));
        return result;
    }

    private Map<String, Object> buildAnnualProjectionReport(List<Subscription> subscriptions) {
        double monthlySpend = subscriptions.stream()
                .mapToDouble(sub -> sub.getBillingCycle() != null && sub.getBillingCycle().equalsIgnoreCase("yearly")
                        ? sub.getAmount() / 12
                        : sub.getAmount())
                .sum();

        double annualProjection = monthlySpend * 12;
        List<Map<String, Object>> forecast = new ArrayList<>();
        LocalDate currentMonth = LocalDate.now();
        for (int i = 0; i < 12; i++) {
            LocalDate target = currentMonth.plusMonths(i);
            double seasonalAdjust = 1 + (Math.sin(i / 2.0) * 0.05);
            forecast.add(Map.of(
                    "month", target.getMonth().name(),
                    "year", target.getYear(),
                    "projectedSpend", round(monthlySpend * seasonalAdjust)
            ));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("monthlySpend", round(monthlySpend));
        result.put("annualProjection", round(annualProjection));
        result.put("forecast", forecast);
        result.put("renewalWatchlist", buildUpcomingRenewals(subscriptions));
        return result;
    }

    private Map<String, Object> buildSummaryMetrics(List<Subscription> subscriptions) {
        double totalMonthlySpend = subscriptions.stream()
                .mapToDouble(sub -> sub.getBillingCycle() != null && sub.getBillingCycle().equalsIgnoreCase("yearly")
                        ? sub.getAmount() / 12
                        : sub.getAmount())
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSubscriptions", subscriptions.size());
        summary.put("totalMonthlySpend", round(totalMonthlySpend));
        summary.put("averagePerSubscription", round(subscriptions.isEmpty() ? 0 : totalMonthlySpend / subscriptions.size()));
        summary.put("costPerDay", round(totalMonthlySpend / 30));
        summary.put("currency", subscriptions.stream()
                .map(Subscription::getCurrency)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("USD"));
        return summary;
    }

    private List<String> buildCategorySuggestions(List<Map<String, Object>> breakdown) {
        return breakdown.stream()
                .limit(3)
                .map(entry -> "Review " + entry.get("category") + " spend of " + entry.get("amount"))
                .collect(Collectors.toList());
    }

    private byte[] buildPdfDocument(Map<String, Object> report) throws DocumentException, IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font monoFont = FontFactory.getFont(FontFactory.COURIER, 9);

        document.add(new Paragraph("SubSentry Report", titleFont));
        document.add(new Paragraph(String.valueOf(report.get("name")), subtitleFont));
        document.add(new Paragraph("Type: " + report.get("type"), bodyFont));
        document.add(new Paragraph("Generated: " + report.get("createdAt"), bodyFont));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Overview", subtitleFont));
        document.add(new Paragraph("Format: PDF", bodyFont));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Content", subtitleFont));
        String prettyContent = OBJECT_MAPPER.writerWithDefaultPrettyPrinter()
                .writeValueAsString(report.get("content"));
        for (String line : prettyContent.split("\n")) {
            document.add(new Paragraph(line, monoFont));
        }

        document.close();
        return out.toByteArray();
    }

    private List<Map<String, Object>> buildCategoryBreakdown(List<Subscription> subscriptions) {
        Map<String, Double> totals = subscriptions.stream()
                .collect(Collectors.groupingBy(
                        sub -> Optional.ofNullable(sub.getCategory()).orElse("Uncategorized"),
                        Collectors.summingDouble(Subscription::getAmount)
                ));

        return totals.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> breakdown = new HashMap<>();
                    breakdown.put("category", entry.getKey());
                    breakdown.put("amount", round(entry.getValue()));
                    return breakdown;
                })
                .sorted(Comparator.comparingDouble(entry -> -((Double) entry.get("amount"))))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildUpcomingRenewals(List<Subscription> subscriptions) {
        LocalDateTime horizon = LocalDateTime.now().plusDays(30);
        return subscriptions.stream()
                .filter(sub -> sub.getNextRenewalDate() != null && sub.getNextRenewalDate().isBefore(horizon))
                .sorted(Comparator.comparing(Subscription::getNextRenewalDate))
                .map(sub -> {
                    Map<String, Object> upcoming = new HashMap<>();
                    upcoming.put("id", sub.getId());
                    upcoming.put("name", sub.getName());
                    upcoming.put("nextRenewalDate", ISO_FORMATTER.format(sub.getNextRenewalDate()));
                    upcoming.put("amount", sub.getAmount());
                    upcoming.put("status", sub.getStatus());
                    return upcoming;
                })
                .collect(Collectors.toList());
    }

    private List<String> buildInsights(List<Subscription> subscriptions, Map<String, Object> summary, Map<String, Object> analytics) {
        List<String> insights = new ArrayList<>();
        int total = (int) summary.getOrDefault("totalSubscriptions", 0);

        if (total > 0) {
            insights.add("You currently manage " + total + " subscriptions.");
        }

        Double totalMonthlySpend = (Double) summary.getOrDefault("totalMonthlySpend", 0.0);
        if (totalMonthlySpend > 0) {
            insights.add("Estimated monthly spend: " + totalMonthlySpend);
        }

        Object upcoming = analytics.get("upcomingRenewals");
        if (upcoming instanceof Number number && number.intValue() > 0) {
            insights.add(number + " renewals are due soon. Review them to avoid unexpected charges.");
        }

        Map<String, Object> heaviestCategory = buildCategoryBreakdown(subscriptions).stream()
                .findFirst()
                .orElse(null);
        if (heaviestCategory != null) {
            insights.add("Highest spend category: " + heaviestCategory.get("category") +
                    " (" + heaviestCategory.get("amount") + "). Consider optimization opportunities.");
        }

        if (insights.isEmpty()) {
            insights.add("Add more subscriptions to unlock analytics-driven insights.");
        }
        return insights;
    }

    private Map<String, Object> createTemplate(String id, String name, String type, String description) {
        Map<String, Object> template = new HashMap<>();
        template.put("id", id);
        template.put("name", name);
        template.put("type", type);
        template.put("description", description);
        return template;
    }

    private LocalDateTime calculateNextRun(String frequency, int dayOfPeriod) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate targetDate = now.toLocalDate();

        switch (frequency == null ? "" : frequency.toLowerCase()) {
            case "weekly" -> targetDate = targetDate.plusWeeks(1);
            case "quarterly" -> targetDate = adjustDay(targetDate.plusMonths(3), dayOfPeriod);
            case "monthly" -> targetDate = adjustDay(targetDate.plusMonths(1), dayOfPeriod);
            default -> targetDate = adjustDay(targetDate.plusMonths(1), dayOfPeriod);
        }

        return targetDate.atTime(9, 0);
    }

    private LocalDate adjustDay(LocalDate date, int day) {
        int safeDay = Math.min(Math.max(day, 1), date.lengthOfMonth());
        return date.withDayOfMonth(safeDay);
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(value, ISO_FORMATTER);
        } catch (Exception ignored) {
        }
        try {
            return LocalDateTime.ofInstant(java.time.Instant.parse(value), ZoneOffset.UTC);
        } catch (Exception ignored) {
        }
        return LocalDateTime.now();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
