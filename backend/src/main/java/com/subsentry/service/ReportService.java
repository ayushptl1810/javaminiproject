package com.subsentry.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.subsentry.dao.ReportDAO;
import com.subsentry.dao.ScheduledReportDAO;
import com.subsentry.model.GeneratedReport;
import com.subsentry.model.ScheduledReport;
import com.subsentry.model.Subscription;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final SubscriptionService subscriptionService;
    private final AnalyticsService analyticsService;
    private final ReportDAO reportDAO;
    private final ScheduledReportDAO scheduledReportDAO;
    private final GeminiService geminiService;
    private final PythonReportService pythonReportService;

    public ReportService(SubscriptionService subscriptionService,
                         AnalyticsService analyticsService,
                         ReportDAO reportDAO,
                         ScheduledReportDAO scheduledReportDAO,
                         GeminiService geminiService,
                         PythonReportService pythonReportService) {
        this.subscriptionService = subscriptionService;
        this.analyticsService = analyticsService;
        this.reportDAO = reportDAO;
        this.scheduledReportDAO = scheduledReportDAO;
        this.geminiService = geminiService;
        this.pythonReportService = pythonReportService;
    }

    public List<GeneratedReport> getReports(String userId) {
        return reportDAO.findByUserId(userId);
    }

    public GeneratedReport generateReport(String userId, Map<String, Object> reportData) {
        String type = String.valueOf(reportData.getOrDefault("type", "summary"));
        if (pythonReportService.isEnabled() && pythonReportService.supports(type)) {
            String reportId = java.util.UUID.randomUUID().toString();
            PythonReportService.PythonReportResult pythonResult = pythonReportService.generateReport(
                    reportId,
                    userId,
                    type
            );
            GeneratedReport report = new GeneratedReport();
            report.setId(reportId);
            report.setUserId(userId);
            report.setName((String) reportData.getOrDefault("name", type + " report"));
            report.setType(type);
            report.setFormat("pdf");
            report.setStatus("completed");
            report.setFilters(reportData);
            report.setContent(pythonResult.toContentMap());
            return reportDAO.save(report);
        }

        Map<String, Object> filters = extractFilters(reportData);
        List<Subscription> subscriptions = applyFilters(userId, filters);

        Map<String, Object> content = switch (type) {
            case "category" -> buildCategoryBreakdownReport(subscriptions);
            case "annual" -> buildAnnualProjectionReport(subscriptions);
            default -> buildMonthlySummaryReport(userId, subscriptions);
        };

        GeneratedReport report = new GeneratedReport();
        report.setUserId(userId);
        report.setName((String) reportData.getOrDefault("name", "Generated Report"));
        report.setType(type);
        report.setFormat(String.valueOf(reportData.getOrDefault("format", "pdf")));
        report.setStatus("completed");
        report.setFilters(filters);
        report.setContent(content);

        return reportDAO.save(report);
    }

    public List<ScheduledReport> getScheduledReports(String userId) {
        return scheduledReportDAO.findByUserId(userId);
    }

    public void deleteReport(String userId, String id) {
        reportDAO.delete(userId, id);
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

    public GeneratedReport getReport(String userId, String id) {
        return reportDAO.findById(userId, id)
                .orElseGet(() -> {
                    GeneratedReport missing = new GeneratedReport();
                    missing.setId(id);
                    missing.setUserId(userId);
                    missing.setStatus("not_found");
                    return missing;
                });
    }

    public byte[] downloadReport(String userId, String id, String format) {
        GeneratedReport report = getReport(userId, id);
        if (!Objects.equals(report.getId(), id) || report.getContent() == null) {
            return "{\"error\":\"Report not found\"}".getBytes(StandardCharsets.UTF_8);
        }

        Object filePath = report.getContent().get("filePath");
        if (filePath != null) {
            try {
                return java.nio.file.Files.readAllBytes(java.nio.file.Path.of(String.valueOf(filePath)));
            } catch (IOException e) {
                throw new IllegalStateException("Unable to read generated report file", e);
            }
        }

        if ("pdf".equalsIgnoreCase(format)) {
            try {
                return buildPdfDocument(report);
            } catch (DocumentException | IOException e) {
                throw new IllegalStateException("Failed to generate PDF report", e);
            }
        }
        try {
            return OBJECT_MAPPER.writerWithDefaultPrettyPrinter()
                    .writeValueAsBytes(Map.of(
                            "metadata", Map.of(
                                    "id", report.getId(),
                                    "name", report.getName(),
                                    "type", report.getType(),
                                    "format", format,
                                    "createdAt", report.getCreatedAt()
                            ),
                            "content", report.getContent()
                    ));
        } catch (JsonProcessingException e) {
            return "{\"error\":\"Report content unavailable\"}".getBytes(StandardCharsets.UTF_8);
        }
    }

    public ScheduledReport scheduleReport(String userId, Map<String, Object> scheduleData) {
        ScheduledReport schedule = new ScheduledReport();
        schedule.setUserId(userId);
        schedule.setName(String.valueOf(scheduleData.getOrDefault("name", "Scheduled Report")));
        schedule.setFrequency(String.valueOf(scheduleData.getOrDefault("frequency", "monthly")));
        schedule.setDayOfPeriod(((Number) scheduleData.getOrDefault("dayOfPeriod", 1)).intValue());
        schedule.setEmailDelivery(Boolean.TRUE.equals(scheduleData.get("emailDelivery")));
        schedule.setReportId((String) scheduleData.get("reportId"));
        schedule.setType(String.valueOf(scheduleData.getOrDefault("type", "summary")));
        Object filters = scheduleData.get("filters");
        if (filters instanceof Map<?, ?> map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> typed = (Map<String, Object>) map;
            schedule.setFilters(typed);
        } else {
            schedule.setFilters(Map.of());
        }
        schedule.setNextRun(calculateNextRun(schedule.getFrequency(), schedule.getDayOfPeriod()));
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());
        return scheduledReportDAO.save(schedule);
    }

    public ScheduledReport updateSchedule(String userId, String id, Map<String, Object> scheduleData) {
        Optional<ScheduledReport> existing = scheduledReportDAO.findById(userId, id);
        if (existing.isEmpty()) {
            ScheduledReport missing = new ScheduledReport();
            missing.setId(id);
            missing.setUserId(userId);
            missing.setName("not_found");
            return missing;
        }
        ScheduledReport schedule = existing.get();
        schedule.setName(String.valueOf(scheduleData.getOrDefault("name", schedule.getName())));
        schedule.setFrequency(String.valueOf(scheduleData.getOrDefault("frequency", schedule.getFrequency())));
        schedule.setDayOfPeriod(((Number) scheduleData.getOrDefault("dayOfPeriod", schedule.getDayOfPeriod())).intValue());
        schedule.setEmailDelivery(
                scheduleData.get("emailDelivery") != null
                        ? Boolean.parseBoolean(scheduleData.get("emailDelivery").toString())
                        : schedule.isEmailDelivery());
        schedule.setReportId((String) scheduleData.getOrDefault("reportId", schedule.getReportId()));
        schedule.setType(String.valueOf(scheduleData.getOrDefault("type", schedule.getType())));
        Object filters = scheduleData.get("filters");
        if (filters instanceof Map<?, ?> filterMap) {
            @SuppressWarnings("unchecked")
            Map<String, Object> typed = (Map<String, Object>) filterMap;
            schedule.setFilters(typed);
        }
        schedule.setNextRun(calculateNextRun(schedule.getFrequency(), schedule.getDayOfPeriod()));
        return scheduledReportDAO.update(schedule);
    }

    public void deleteSchedule(String userId, String id) {
        scheduledReportDAO.delete(userId, id);
    }

    public GeneratedReport generateAiReport(String userId, Map<String, Object> payload) {
        System.out.println("Generating AI report for user " + userId);
        System.out.println("Payload: " + payload);
        validateAiPayload(payload);

        Map<String, Object> analyticsContext = buildAnalyticsContext(userId, payload);
        Map<String, Object> enrichedPayload = new HashMap<>(payload);
        enrichedPayload.put("analyticsContext", analyticsContext);

        String narrative = geminiService.generateReportSummary(enrichedPayload);

        GeneratedReport report = new GeneratedReport();
        report.setUserId(userId);
        report.setName(String.valueOf(payload.getOrDefault("name", "AI Report")));
        report.setType(String.valueOf(payload.getOrDefault("type", "ai_summary")));
        report.setFormat("markdown");
        report.setStatus("completed");
        report.setFilters(payload);

        Map<String, Object> content = new LinkedHashMap<>();
        content.put("narrative", narrative);
        content.put("analyticsContext", analyticsContext);
        content.put("generatedAt", LocalDateTime.now().toString());
        report.setContent(content);

        System.out.println("AI report generated successfully");
        return reportDAO.save(report);
    }

    private void validateAiPayload(Map<String, Object> payload) {
        if (payload == null) {
            throw new IllegalArgumentException("Report payload is required");
        }
        if (payload.get("name") == null || String.valueOf(payload.get("name")).isBlank()) {
            throw new IllegalArgumentException("Report name is required");
        }
        if (payload.get("type") == null || String.valueOf(payload.get("type")).isBlank()) {
            throw new IllegalArgumentException("Report type is required");
        }
        if (payload.get("startDate") == null || payload.get("endDate") == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
    }

    private Map<String, Object> buildAnalyticsContext(String userId, Map<String, Object> payload) {
        Map<String, Object> context = new LinkedHashMap<>();

        context.put("reportMeta", Map.of(
                "name", payload.get("name"),
                "type", payload.get("type"),
                "dateRange", Map.of(
                        "start", payload.get("startDate"),
                        "end", payload.get("endDate")
                ),
                "categories", payload.getOrDefault("categories", List.of("All")),
                "format", payload.getOrDefault("format", "pdf"),
                "includeCharts", payload.getOrDefault("includeCharts", true),
                "includeInsights", payload.getOrDefault("includeInsights", true)
        ));

        // Extract dateRange from payload or use "all" for all data
        String dateRange = payload.containsKey("dateRange") && payload.get("dateRange") instanceof String 
            ? (String) payload.get("dateRange") 
            : "all";
        
        Map<String, Object> overview = analyticsService.getOverview(userId, dateRange);
        context.put("overview", overview);
        context.put("spendingTrend", analyticsService.getSpendingTrend(userId, dateRange).get("monthlyData"));
        context.put("categoryBreakdown", analyticsService.getCategoryBreakdown(userId, dateRange).get("categories"));
        context.put("billingCycleMix", analyticsService.getBillingCycleAnalysis(userId, dateRange).get("cycles"));
        context.put("topSubscriptions", analyticsService.getTopSubscriptions(userId, dateRange).get("subscriptions"));
        context.put("projections", analyticsService.getProjections(userId));
        context.put("insights", analyticsService.getInsights(userId).get("insights"));

        List<Map<String, Object>> notableSubscriptions = subscriptionService.getAllSubscriptions(userId, null, null)
                .stream()
                .sorted(Comparator.comparingDouble(Subscription::getAmount).reversed())
                .limit(15)
                .map(this::mapSubscription)
                .collect(Collectors.toList());
        context.put("notableSubscriptions", notableSubscriptions);

        List<Map<String, Object>> renewals = subscriptionService.getUpcomingSubscriptions(userId, 30)
                .stream()
                .map(this::mapSubscription)
                .collect(Collectors.toList());
        context.put("upcomingRenewals30d", renewals);

        context.put("generatedAt", LocalDateTime.now().toString());
        return context;
    }

    private Map<String, Object> mapSubscription(Subscription sub) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", sub.getId());
        map.put("name", sub.getName());
        map.put("category", sub.getCategory());
        map.put("amount", round(sub.getAmount()));
        map.put("currency", sub.getCurrency());
        map.put("billingCycle", sub.getBillingCycle());
        map.put("status", sub.getStatus());
        map.put("nextRenewalDate", sub.getNextRenewalDate());
        map.put("startDate", sub.getStartDate());
        return map;
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

    private List<Subscription> applyFilters(String userId, Map<String, Object> filters) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, null, null);

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

    private Map<String, Object> buildMonthlySummaryReport(String userId, List<Subscription> subscriptions) {
        Map<String, Object> summary = buildSummaryMetrics(subscriptions);
        Map<String, Object> overview = analyticsService.getOverview(userId, null);

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

    private byte[] buildPdfDocument(GeneratedReport report) throws DocumentException, IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font monoFont = FontFactory.getFont(FontFactory.COURIER, 9);

        document.add(new Paragraph("SubSentry Report", titleFont));
        document.add(new Paragraph(String.valueOf(report.getName()), subtitleFont));
        document.add(new Paragraph("Type: " + report.getType(), bodyFont));
        document.add(new Paragraph("Generated: " + report.getCreatedAt(), bodyFont));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Overview", subtitleFont));
        document.add(new Paragraph("Format: PDF", bodyFont));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Content", subtitleFont));
        String prettyContent = OBJECT_MAPPER.writerWithDefaultPrettyPrinter()
                .writeValueAsString(report.getContent());
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

    public LocalDateTime calculateNextRun(String frequency, int dayOfPeriod) {
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
