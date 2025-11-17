package com.subsentry.controller;

import com.subsentry.model.GeneratedReport;
import com.subsentry.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @GetMapping
    public ResponseEntity<?> getReports(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(Map.of("data", reportService.getReports(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch reports"));
        }
    }
    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestParam String userId,
                                            @RequestBody Map<String, Object> reportData) {
        try {
            System.out.println("ReportController.generateReport: userId=" + userId + ", payload=" + reportData);
            GeneratedReport report = reportService.generateReport(userId, reportData);
            return ResponseEntity.ok(Map.of("data", report));
        } catch (Exception e) {
            System.out.println("ReportController.generateReport error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/ai")
    public ResponseEntity<?> generateAiReport(@RequestParam String userId,
                                              @RequestBody Map<String, Object> reportData) {
        try {
            System.out.println("ReportController.generateAiReport: userId=" + userId + ", payload=" + reportData);
            GeneratedReport report = reportService.generateAiReport(userId, reportData);
            return ResponseEntity.ok(Map.of("data", report));
        } catch (Exception e) {
            System.out.println("ReportController.generateAiReport error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/scheduled")
    public ResponseEntity<?> getScheduledReports(@RequestParam String userId) {
        try {
            return ResponseEntity.ok(Map.of("data", reportService.getScheduledReports(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch scheduled reports"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@RequestParam String userId, @PathVariable String id) {
        try {
            reportService.deleteReport(userId, id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete report"));
        }
    }
    
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() {
        try {
            Map<String, Object> templates = reportService.getTemplates();
            return ResponseEntity.ok(Map.of("data", templates.get("templates")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch templates"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getReport(@RequestParam String userId, @PathVariable String id) {
        try {
            return ResponseEntity.ok(Map.of("data", reportService.getReport(userId, id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch report"));
        }
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadReport(@RequestParam String userId,
                                                 @PathVariable String id,
                                                 @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] payload = reportService.downloadReport(userId, id, format);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + id + "." + format)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(payload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(("Failed to download report").getBytes(StandardCharsets.UTF_8));
        }
    }
    
    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleReport(@RequestParam String userId,
                                            @RequestBody Map<String, Object> scheduleData) {
        try {
            return ResponseEntity.ok(Map.of("data", reportService.scheduleReport(userId, scheduleData)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to schedule report"));
        }
    }
    
    @PutMapping("/schedule/{id}")
    public ResponseEntity<?> updateSchedule(@RequestParam String userId,
                                            @PathVariable String id,
                                            @RequestBody Map<String, Object> scheduleData) {
        try {
            return ResponseEntity.ok(Map.of("data", reportService.updateSchedule(userId, id, scheduleData)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update schedule"));
        }
    }
    
    @DeleteMapping("/schedule/{id}")
    public ResponseEntity<?> deleteSchedule(@RequestParam String userId, @PathVariable String id) {
        try {
            reportService.deleteSchedule(userId, id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete schedule"));
        }
    }
}