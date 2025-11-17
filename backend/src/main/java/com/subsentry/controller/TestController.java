package com.subsentry.controller;

import com.subsentry.service.ScheduledTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private ScheduledTaskService scheduledTaskService;

    /**
     * Manually trigger renewal reminder check for testing
     */
    @PostMapping("/trigger-renewal-reminders")
    public ResponseEntity<?> triggerRenewalReminders() {
        try {
            scheduledTaskService.checkRenewalReminders();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Renewal reminder check completed. Check logs for details."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Manually trigger scheduled report processing for testing
     */
    @PostMapping("/trigger-scheduled-reports")
    public ResponseEntity<?> triggerScheduledReports() {
        try {
            scheduledTaskService.processScheduledReports();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Scheduled report processing completed. Check logs for details."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Manually trigger weekly summary sending for testing
     */
    @PostMapping("/trigger-weekly-summaries")
    public ResponseEntity<?> triggerWeeklySummaries() {
        try {
            scheduledTaskService.sendWeeklySummaries();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Weekly summary sending completed. Check logs for details."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }
}
