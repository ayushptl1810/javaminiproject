package com.subsentry.service;

import com.subsentry.model.Subscription;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final SubscriptionService subscriptionService;

    public AnalyticsService(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    public Map<String, Object> getOverview(String userId) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, null, null);

        double totalMonthlySpending = subscriptions.stream()
                .mapToDouble(sub -> {
                    String cycle = sub.getBillingCycle() == null ? "monthly" : sub.getBillingCycle();
                    if ("annual".equalsIgnoreCase(cycle) || "yearly".equalsIgnoreCase(cycle)) {
                        return sub.getAmount() / 12;
                    }
                    if ("semi-annual".equalsIgnoreCase(cycle)) {
                        return sub.getAmount() / 6;
                    }
                    if ("quarterly".equalsIgnoreCase(cycle)) {
                        return sub.getAmount() / 3;
                    }
                    if ("weekly".equalsIgnoreCase(cycle)) {
                        return sub.getAmount() * 4;
                    }
                    return sub.getAmount();
                })
                .sum();

        double annualProjection = totalMonthlySpending * 12;
        double costPerDay = totalMonthlySpending / 30;

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalSubscriptions", subscriptions.size());
        overview.put("activeSubscriptions", subscriptions.stream()
                .filter(sub -> !"cancelled".equalsIgnoreCase(sub.getStatus()))
                .count());
        overview.put("averageMonthlySpending", round(totalMonthlySpending));
        overview.put("totalSpent", round(totalMonthlySpending));
        overview.put("averageMonthly", round(totalMonthlySpending));
        overview.put("annualProjection", round(annualProjection));
        overview.put("costPerDay", round(costPerDay));
        overview.put("upcomingRenewals", subscriptionService.getUpcomingSubscriptions(userId, 30).size());
        overview.put("categoryCount", subscriptions.stream()
                .map(sub -> sub.getCategory() == null ? "Uncategorized" : sub.getCategory())
                .distinct()
                .count());

        return overview;
    }

    public Map<String, Object> getSpendingTrend(String userId) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, null, null);
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth period = YearMonth.from(now).minusMonths(i);
            double total = subscriptions.stream()
                    .filter(sub -> sub.getStartDate() != null && YearMonth.from(sub.getStartDate()).equals(period))
                    .mapToDouble(Subscription::getAmount)
                    .sum();
            Map<String, Object> monthEntry = new HashMap<>();
            monthEntry.put("month", period.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            monthEntry.put("total", round(total));
            monthlyData.add(monthEntry);
        }
        return Map.of("monthlyData", monthlyData);
    }

    public Map<String, Object> getCategoryBreakdown(String userId) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, null, null);
        Map<String, Double> categoryTotals = subscriptions.stream()
                .collect(Collectors.groupingBy(
                        sub -> sub.getCategory() == null ? "Uncategorized" : sub.getCategory(),
                        Collectors.summingDouble(Subscription::getAmount)
                ));
        List<Map<String, Object>> categories = categoryTotals.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", round(entry.getValue()));
                    return item;
                })
                .collect(Collectors.toList());
        return Map.of("categories", categories);
    }

    public Map<String, Object> getBillingCycleAnalysis(String userId) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, null, null);
        Map<String, Long> cycles = subscriptions.stream()
                .collect(Collectors.groupingBy(
                        sub -> sub.getBillingCycle() == null ? "monthly" : sub.getBillingCycle(),
                        Collectors.counting()
                ));
        List<Map<String, Object>> data = cycles.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("name", entry.getKey());
                    row.put("value", entry.getValue());
                    return row;
                })
                .collect(Collectors.toList());
        return Map.of("cycles", data);
    }

    public Map<String, Object> getTopSubscriptions(String userId) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, null, null);
        List<Map<String, Object>> top = subscriptions.stream()
                .sorted((a, b) -> Double.compare(b.getAmount(), a.getAmount()))
                .limit(5)
                .map(sub -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", sub.getName());
                    item.put("amount", round(sub.getAmount()));
                    item.put("category", sub.getCategory());
                    return item;
                })
                .collect(Collectors.toList());
        return Map.of("subscriptions", top);
    }

    public Map<String, Object> getProjections(String userId) {
        Map<String, Object> overview = getOverview(userId);
        double annualProjection = ((Number) overview.getOrDefault("annualProjection", 0)).doubleValue();
        double monthlyProjection = annualProjection / 12;
        Map<String, Object> result = new HashMap<>();
        result.put("annualProjection", round(annualProjection));
        result.put("monthlyProjection", round(monthlyProjection));
        result.put("trend", monthlyProjection > 0 ? "increasing" : "flat");
        return result;
    }

    public Map<String, Object> getInsights(String userId) {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions(userId, null, null);
        List<String> insights = new ArrayList<>();
        if (subscriptions.isEmpty()) {
            insights.add("Add your first subscription to unlock analytics.");
        } else {
            insights.add("You currently manage " + subscriptions.size() + " subscriptions.");
            double totalSpend = subscriptions.stream().mapToDouble(Subscription::getAmount).sum();
            insights.add("Average subscription cost is " + round(totalSpend / subscriptions.size()));
            long renewalsSoon = subscriptionService.getUpcomingSubscriptions(userId, 7).size();
            if (renewalsSoon > 0) {
                insights.add(renewalsSoon + " renewals due in the next week.");
            }
        }
        return Map.of("insights", insights);
    }

    public Map<String, Object> compareSubscriptions(String userId, List<String> subscriptionIds) {
        List<Subscription> subscriptions = subscriptionIds == null || subscriptionIds.isEmpty()
                ? List.of()
                : subscriptionIds.stream()
                .map(id -> subscriptionService.getSubscriptionById(userId, id))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        List<Map<String, Object>> comparison = subscriptions.stream()
                .map(sub -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", sub.getId());
                    map.put("name", sub.getName());
                    map.put("amount", round(sub.getAmount()));
                    map.put("billingCycle", sub.getBillingCycle());
                    map.put("category", sub.getCategory());
                    return map;
                })
                .collect(Collectors.toList());

        return Map.of("comparison", comparison);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
