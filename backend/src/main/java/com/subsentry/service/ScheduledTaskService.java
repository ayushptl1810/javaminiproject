package com.subsentry.service;

import com.subsentry.dao.ScheduledReportDAO;
import com.subsentry.dao.SubscriptionDAO;
import com.subsentry.dao.UserDAO;
import com.subsentry.model.ScheduledReport;
import com.subsentry.model.Subscription;
import com.subsentry.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM d, yyyy");

    private final EmailService emailService;
    private final UserDAO userDAO;
    private final SubscriptionDAO subscriptionDAO;
    private final ScheduledReportDAO scheduledReportDAO;
    private final ReportService reportService;

    public ScheduledTaskService(
            EmailService emailService,
            UserDAO userDAO,
            SubscriptionDAO subscriptionDAO,
            ScheduledReportDAO scheduledReportDAO,
            ReportService reportService) {
        this.emailService = emailService;
        this.userDAO = userDAO;
        this.subscriptionDAO = subscriptionDAO;
        this.scheduledReportDAO = scheduledReportDAO;
        this.reportService = reportService;
    }

    /**
     * Check for upcoming renewals and send email reminders.
     * Runs daily at 9:00 AM.
     */
    @Scheduled(cron = "0 0 9 * * *") // Every day at 9 AM
    public void checkRenewalReminders() {
        logger.info("Starting renewal reminder check...");
        try {
            List<User> users = userDAO.getAllUsers();
            int emailsSent = 0;

            for (User user : users) {
                logger.debug("Checking user: {} (email: {})", user.getId(), user.getEmail());
                logger.debug("  - emailNotifications: {}", user.isEmailNotifications());
                logger.debug("  - renewalReminders: {}", user.isRenewalReminders());
                
                // Skip if user has disabled renewal reminders or email notifications
                if (!user.isEmailNotifications() || !user.isRenewalReminders()) {
                    logger.debug("  - Skipping user {}: email notifications or renewal reminders disabled", user.getEmail());
                    continue;
                }

                // Get subscriptions renewing in the next 7 days
                List<Subscription> upcomingRenewals = subscriptionDAO.findUpcoming(user.getId(), 7);
                logger.info("  - Found {} upcoming renewals for user {}", upcomingRenewals.size(), user.getEmail());

                if (!upcomingRenewals.isEmpty()) {
                    try {
                        sendRenewalReminderEmail(user, upcomingRenewals);
                        emailsSent++;
                    } catch (Exception e) {
                        logger.error("Failed to send renewal reminder to {}", user.getEmail(), e);
                    }
                } else {
                    logger.debug("  - No upcoming renewals found for user {}", user.getEmail());
                }
            }

            logger.info("Renewal reminder check completed. Sent {} email(s).", emailsSent);
        } catch (Exception e) {
            logger.error("Error checking renewal reminders", e);
        }
    }

    /**
     * Check for scheduled reports that need to be generated and sent.
     * Runs every hour.
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void processScheduledReports() {
        logger.info("Starting scheduled report processing...");
        try {
            List<ScheduledReport> dueReports = scheduledReportDAO.findDueReports();
            int reportsProcessed = 0;

            for (ScheduledReport schedule : dueReports) {
                try {
                    User user = userDAO.getUserById(schedule.getUserId());
                    if (user == null || !user.isEmailNotifications()) {
                        logger.warn("Skipping scheduled report {} - user not found or email disabled", schedule.getId());
                        continue;
                    }

                    // Generate the report
                    Map<String, Object> filters = schedule.getFilters();
                    @SuppressWarnings("unchecked")
                    List<String> categories = (List<String>) filters.getOrDefault("categories", List.of());
                    
                    Map<String, Object> reportData = new java.util.HashMap<>();
                    reportData.put("name", schedule.getName());
                    reportData.put("type", schedule.getType());
                    reportData.put("format", "pdf");
                    reportData.put("includeCharts", true);
                    reportData.put("includeInsights", true);
                    reportData.put("dateRange", "allTime");
                    reportData.put("startDate", LocalDateTime.now().minusMonths(1).toString());
                    reportData.put("endDate", LocalDateTime.now().toString());
                    reportData.put("categories", categories);

                    var generatedReport = reportService.generateReport(schedule.getUserId(), reportData);

                    // Send email if email delivery is enabled
                    if (schedule.isEmailDelivery()) {
                        try {
                            sendScheduledReportEmail(user, generatedReport, schedule);
                        } catch (Exception e) {
                            logger.error("Failed to send scheduled report email to {}", user.getEmail(), e);
                        }
                    }

                    // Update next run time
                    schedule.setNextRun(reportService.calculateNextRun(schedule.getFrequency(), schedule.getDayOfPeriod()));
                    scheduledReportDAO.update(schedule);

                    reportsProcessed++;
                    logger.info("Processed scheduled report {} for user {}", schedule.getId(), user.getEmail());
                } catch (Exception e) {
                    logger.error("Error processing scheduled report {}", schedule.getId(), e);
                }
            }

            logger.info("Scheduled report processing completed. Processed {} report(s).", reportsProcessed);
        } catch (Exception e) {
            logger.error("Error processing scheduled reports", e);
        }
    }

    /**
     * Send weekly summary emails to users who have opted in.
     * Runs every Monday at 9:00 AM.
     */
    @Scheduled(cron = "0 0 9 * * MON") // Every Monday at 9 AM
    public void sendWeeklySummaries() {
        logger.info("Starting weekly summary email sending...");
        try {
            List<User> users = userDAO.getAllUsers();
            int emailsSent = 0;

            for (User user : users) {
                // Skip if user has disabled weekly summaries or email notifications
                if (!user.isEmailNotifications() || !user.isWeeklySummary()) {
                    continue;
                }

                // Generate weekly summary report
                try {
                    Map<String, Object> reportData = new java.util.HashMap<>();
                    reportData.put("name", "Weekly Summary Report");
                    reportData.put("type", "summary");
                    reportData.put("format", "pdf");
                    reportData.put("includeCharts", true);
                    reportData.put("includeInsights", true);
                    reportData.put("dateRange", "custom");
                    reportData.put("startDate", LocalDateTime.now().minusDays(7).toString());
                    reportData.put("endDate", LocalDateTime.now().toString());

                    var generatedReport = reportService.generateReport(user.getId(), reportData);
                    try {
                        sendWeeklySummaryEmail(user, generatedReport);
                        emailsSent++;
                    } catch (Exception e) {
                        logger.error("Failed to send weekly summary to {}", user.getEmail(), e);
                    }
                } catch (Exception e) {
                    logger.error("Error generating weekly summary for user {}", user.getEmail(), e);
                }
            }

            logger.info("Weekly summary email sending completed. Sent {} email(s).", emailsSent);
        } catch (Exception e) {
            logger.error("Error sending weekly summaries", e);
        }
    }

    private void sendRenewalReminderEmail(User user, List<Subscription> renewals) {
        try {
            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(user.getName()).append(",\n\n");
            body.append("This is a reminder that you have subscription(s) renewing soon:\n\n");

            double totalAmount = 0.0;
            for (Subscription sub : renewals) {
                long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(
                        LocalDateTime.now(),
                        sub.getNextRenewalDate()
                );
                String daysText = daysUntil == 0 ? "today" : (daysUntil == 1 ? "tomorrow" : daysUntil + " days");
                body.append(String.format("• %s - %s %s (renews in %s)\n",
                        sub.getName(),
                        sub.getCurrency(),
                        String.format("%.2f", sub.getAmount()),
                        daysText));
                totalAmount += sub.getAmount();
            }

            body.append("\n");
            body.append(String.format("Total amount: %s %.2f\n\n", renewals.get(0).getCurrency(), totalAmount));
            body.append("Please ensure your payment method is up to date.\n\n");
            body.append("Best regards,\nSubSentry Team");

            emailService.sendEmail(
                    user.getEmail(),
                    "Subscription Renewal Reminder",
                    body.toString()
            );

            logger.info("Sent renewal reminder email to {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Error sending renewal reminder email to {}", user.getEmail(), e);
        }
    }

    private void sendScheduledReportEmail(User user, com.subsentry.model.GeneratedReport report, ScheduledReport schedule) {
        try {
            String subject = "Your Scheduled Report: " + schedule.getName();
            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(user.getName()).append(",\n\n");
            body.append("Your scheduled report \"").append(schedule.getName()).append("\" has been generated.\n\n");
            body.append("Report Details:\n");
            body.append("• Type: ").append(schedule.getType()).append("\n");
            body.append("• Generated: ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("\n\n");
            body.append("You can view and download this report from your SubSentry dashboard.\n\n");
            body.append("Best regards,\nSubSentry Team");

            emailService.sendEmail(user.getEmail(), subject, body.toString());
            logger.info("Sent scheduled report email to {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Error sending scheduled report email to {}", user.getEmail(), e);
        }
    }

    private void sendWeeklySummaryEmail(User user, com.subsentry.model.GeneratedReport report) {
        try {
            String subject = "Your Weekly Subscription Summary";
            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(user.getName()).append(",\n\n");
            body.append("Here's your weekly subscription summary for the past 7 days.\n\n");
            body.append("Report Details:\n");
            body.append("• Type: Weekly Summary\n");
            body.append("• Period: Last 7 days\n");
            body.append("• Generated: ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("\n\n");
            body.append("You can view and download the full report from your SubSentry dashboard.\n\n");
            body.append("Best regards,\nSubSentry Team");

            emailService.sendEmail(user.getEmail(), subject, body.toString());
            logger.info("Sent weekly summary email to {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Error sending weekly summary email to {}", user.getEmail(), e);
        }
    }
}

