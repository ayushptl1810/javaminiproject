package com.subsentry.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SettingsService {
    
    private Map<String, Object> mockSettings = new HashMap<>();
    private List<String> mockCategories = new ArrayList<>();
    private List<String> mockCurrencies = new ArrayList<>();
    
    public SettingsService() {
        initializeMockData();
    }
    
    private void initializeMockData() {
        // Initialize settings
        mockSettings.put("defaultCurrency", "USD");
        mockSettings.put("emailNotifications", true);
        mockSettings.put("browserNotifications", true);
        mockSettings.put("theme", "light");
        mockSettings.put("language", "en");
        
        // Initialize categories
        mockCategories.addAll(Arrays.asList(
            "Streaming", "Software", "Cloud Services", "Gym/Fitness", 
            "News/Magazines", "Gaming", "Music", "Productivity", "Security", "Other"
        ));
        
        // Initialize currencies
        mockCurrencies.addAll(Arrays.asList("USD", "EUR", "GBP", "CAD", "AUD", "JPY"));
    }
    
    public Map<String, Object> getSettings() {
        return new HashMap<>(mockSettings);
    }
    
    public void updateSettings(Map<String, Object> settings) {
        mockSettings.putAll(settings);
    }
    
    public Map<String, Object> getCategories() {
        Map<String, Object> result = new HashMap<>();
        result.put("categories", mockCategories);
        return result;
    }
    
    public void addCategory(Map<String, Object> category) {
        String categoryName = (String) category.get("name");
        if (categoryName != null && !mockCategories.contains(categoryName)) {
            mockCategories.add(categoryName);
        }
    }
    
    public void updateCategory(String id, Map<String, Object> category) {
        // Mock implementation - in real app would update by ID
        System.out.println("Updating category " + id + ": " + category);
    }
    
    public void deleteCategory(String id) {
        // Mock implementation - in real app would delete by ID
        System.out.println("Deleting category: " + id);
    }
    
    public Map<String, Object> getCurrencies() {
        Map<String, Object> result = new HashMap<>();
        result.put("currencies", mockCurrencies);
        return result;
    }
    
    public void updateCurrency(String currency) {
        mockSettings.put("defaultCurrency", currency);
    }
}
