package com.subsentry.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
public class GeminiService {

    private static final List<String> API_VERSIONS = List.of("v1", "v1beta");
    private static final List<String> MODEL_PRIORITY = List.of(
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash-lite-001",
            "gemini-2.5-pro",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro",
            "gemini-pro"
    );

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;

    public GeminiService(@Value("${gemini.api.key:}") String apiKey) {
        this.apiKey = resolveApiKey(apiKey);
    }

    public String generateReportSummary(Map<String, Object> payload) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String prompt = buildPrompt(payload);
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", prompt))
                        )
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        System.out.println("Gemini request prompt: " + prompt);
        HttpClientErrorException lastNotFound = null;
        for (String version : API_VERSIONS) {
            for (String model : MODEL_PRIORITY) {
                String endpoint = buildEndpoint(version, model);
                try {
                    ResponseEntity<String> response = restTemplate.exchange(
                            endpoint + apiKey,
                            HttpMethod.POST,
                            entity,
                            String.class
                    );

                    System.out.println("Gemini response status (" + version + "/" + model + "): " + response.getStatusCode());
                    System.out.println("Gemini response body: " + response.getBody());

                    if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                        throw new IllegalStateException("Gemini API request failed with status " + response.getStatusCode());
                    }

                    return extractText(response.getBody());
                } catch (HttpClientErrorException.NotFound nf) {
                    lastNotFound = nf;
                    System.out.println("Gemini model not found for " + version + "/" + model + ": " + nf.getResponseBodyAsString());
                } catch (HttpClientErrorException ex) {
                    throw new IllegalStateException("Gemini API error: " + ex.getResponseBodyAsString(), ex);
                }
            }
        }

        if (lastNotFound != null) {
            throw new IllegalStateException("Unable to reach any Gemini model. Last error: " + lastNotFound.getResponseBodyAsString(), lastNotFound);
        }

        throw new IllegalStateException("Unable to reach any Gemini model. No additional error details.");
    }

    private String buildEndpoint(String version, String model) {
        return "https://generativelanguage.googleapis.com/" + version + "/models/" + model + ":generateContent?key=";
    }

    private String resolveApiKey(String configuredKey) {
        if (configuredKey != null && !configuredKey.isBlank()) {
            return configuredKey.trim();
        }

        String fromEnv = System.getenv("GEMINI_API_KEY");
        if (fromEnv != null && !fromEnv.isBlank()) {
            return fromEnv.trim();
        }

        String fromFile = loadFromEnvFile();
        if (fromFile != null && !fromFile.isBlank()) {
            System.out.println("Loaded GEMINI_API_KEY from .env file");
            return fromFile.trim();
        }

        return "";
    }

    private String loadFromEnvFile() {
        List<Path> candidates = List.of(
                Path.of(".env"),
                Path.of("../.env"),
                Path.of("../../.env")
        );

        for (Path path : candidates) {
            if (!Files.exists(path)) {
                continue;
            }
            try (Stream<String> lines = Files.lines(path)) {
                return lines
                        .map(String::trim)
                        .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                        .map(line -> line.split("=", 2))
                        .filter(parts -> parts.length == 2 && parts[0].trim().equals("GEMINI_API_KEY"))
                        .map(parts -> parts[1].trim())
                        .findFirst()
                        .orElse(null);
            } catch (IOException ignored) {
            }
        }
        return null;
    }

    private String extractText(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            return root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText("");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Gemini response", e);
        }
    }

    private String buildPrompt(Map<String, Object> payload) {
        String type = String.valueOf(payload.getOrDefault("type", "summary"));
        String name = String.valueOf(payload.getOrDefault("name", "Subscription Report"));
        String startDate = String.valueOf(payload.getOrDefault("startDate", "N/A"));
        String endDate = String.valueOf(payload.getOrDefault("endDate", "N/A"));
        String categories = serializeCategories(payload.get("categories"));
        String analyticsJson = stringify(payload.get("analyticsContext"));

        return """
                You are SubSentry's senior subscription analyst. Using the structured analytics JSON below, craft a comprehensive %s report titled "%s" covering %s to %s.

                Dataset:
                %s

                Writing instructions:
                - Audience: busy finance leads who expect data-backed storytelling.
                - Produce 5 sections in Markdown with clear headings:
                  1. Executive Summary (~150 words, highlight notable changes and risk)
                  2. Key Metrics Table (monthly spend, cost per day, annual projection, active subscriptions, renewals due, etc.)
                  3. Category & Subscription Analysis (call out top categories and subscriptions with exact figures and trends)
                  4. Trend & Forecast Insights (reference historic trend data, projections, seasonality, renewal pipeline)
                  5. Recommendations & Next Steps (actionable bullets grouped by priority)
                - Reference actual numbers from the dataset (include currency symbols) and compare categories or periods where possible.
                - Mention upcoming renewals (names + dates) and any anomalies (e.g., unchecked categories, large single vendors).
                - Aim for 600-750 words total. Use bullet lists and tables where helpful.
                - Output strictly in Markdown without enclosing backticks so it can be rendered directly.

                Categories requested: %s.
                """.formatted(type, name, startDate, endDate, analyticsJson, categories);
    }

    private String serializeCategories(Object value) {
        if (value instanceof List<?> list && !list.isEmpty()) {
            return String.join(", ", list.stream().map(String::valueOf).toList());
        }
        return "All";
    }

    private String stringify(Object value) {
        if (value == null) {
            return "{}";
        }
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return String.valueOf(value);
        }
    }
}

