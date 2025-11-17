package com.subsentry.controller;

import com.subsentry.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {
    
    @Autowired
    private SettingsService settingsService;
    
    @GetMapping
    public ResponseEntity<?> getSettings(@RequestParam String userId) {
        try {
            Map<String, Object> settings = settingsService.getSettings(userId);
            return ResponseEntity.ok(Map.of("data", settings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch settings"));
        }
    }
    
    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestParam String userId,
                                            @RequestBody Map<String, Object> settings) {
        try {
            settingsService.updateSettings(userId, settings);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update settings"));
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(@RequestParam String userId) {
        try {
            Map<String, Object> categories = settingsService.getCategories(userId);
            return ResponseEntity.ok(Map.of("data", categories.get("available")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch categories"));
        }
    }
    
    @PostMapping("/categories")
    public ResponseEntity<?> addCategory(@RequestParam String userId,
                                         @RequestBody Map<String, Object> category) {
        try {
            settingsService.addCategory(userId, category);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add category"));
        }
    }
    
    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@RequestParam String userId,
                                            @PathVariable String id,
                                            @RequestBody Map<String, Object> category) {
        try {
            settingsService.updateCategory(userId, id, category);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update category"));
        }
    }
    
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@RequestParam String userId, @PathVariable String id) {
        try {
            settingsService.deleteCategory(userId, id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete category"));
        }
    }
    
    @GetMapping("/currencies")
    public ResponseEntity<?> getCurrencies() {
        try {
            Map<String, Object> currencies = settingsService.getCurrencies();
            return ResponseEntity.ok(Map.of("data", currencies.get("currencies")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch currencies"));
        }
    }
    
    @PutMapping("/currency")
    public ResponseEntity<?> updateCurrency(@RequestParam String userId,
                                            @RequestBody Map<String, Object> request) {
        try {
            String currency = (String) request.get("currency");
            settingsService.updateCurrency(userId, currency);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update currency"));
        }
    }
}
