package com.subsentry.controller;

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
    public ResponseEntity<?> getReports() {
        try {
            Map<String, Object> reports = reportService.getReports();
            return ResponseEntity.ok(Map.of("data", reports.get("reports")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch reports"));
        }
    }
    
    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, Object> reportData) {
        try {
            Map<String, Object> report = reportService.generateReport(reportData);
            return ResponseEntity.ok(Map.of("data", report));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate report"));
        }
    }
    
    @GetMapping("/scheduled")
    public ResponseEntity<?> getScheduledReports() {
        try {
            Map<String, Object> scheduled = reportService.getScheduledReports();
            return ResponseEntity.ok(Map.of("data", scheduled.get("reports")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch scheduled reports"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable String id) {
        try {
            reportService.deleteReport(id);
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
    public ResponseEntity<?> getReport(@PathVariable String id) {
        try {
            Map<String, Object> report = reportService.getReport(id);
            return ResponseEntity.ok(Map.of("data", report));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch report"));
        }
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadReport(@PathVariable String id, @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] payload = reportService.downloadReport(id, format);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + id + "." + format)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(payload);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(("Failed to download report").getBytes(StandardCharsets.UTF_8));
        }
    }
    
    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleReport(@RequestBody Map<String, Object> scheduleData) {
        try {
            Map<String, Object> schedule = reportService.scheduleReport(scheduleData);
            return ResponseEntity.ok(Map.of("data", schedule));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to schedule report"));
        }
    }
    
    @PutMapping("/schedule/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable String id, @RequestBody Map<String, Object> scheduleData) {
        try {
            Map<String, Object> schedule = reportService.updateSchedule(id, scheduleData);
            return ResponseEntity.ok(Map.of("data", schedule));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update schedule"));
        }
    }
    
    @DeleteMapping("/schedule/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable String id) {
        try {
            reportService.deleteSchedule(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete schedule"));
        }
    }
}
