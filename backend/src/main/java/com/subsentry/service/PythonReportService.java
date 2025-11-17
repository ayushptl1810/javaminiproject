package com.subsentry.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PythonReportService {

    private static final Pattern MYSQL_URL = Pattern.compile("jdbc:mysql://([\\w.-]+)(?::(\\d+))?/([^?]+).*");
    private static final Map<String, String> TYPE_MAP = Map.of(
            "summary", "monthly_summary",
            "category", "category_breakdown",
            "trend", "annual_projection"
    );

    private final boolean enabled;
    private final String pythonCommand;
    private final String scriptPath;
    private final String outputDir;
    private final Duration processTimeout;
    private final ObjectMapper objectMapper;

    private final String dbHost;
    private final int dbPort;
    private final String dbName;
    private final String dbUser;
    private final String dbPassword;

    public PythonReportService(
            @Value("${reports.python.enabled:true}") boolean enabled,
            @Value("${reports.python.command:python3}") String pythonCommand,
            @Value("${reports.python.script:scripts/report_generator.py}") String scriptPath,
            @Value("${reports.python.output-dir:${java.io.tmpdir}/subsentry-python-reports}") String outputDir,
            @Value("${reports.python.timeout-ms:90000}") long timeoutMs,
            DataSourceProperties dataSourceProperties,
            ObjectMapper objectMapper
    ) {
        this.enabled = enabled;
        this.pythonCommand = resolvePythonCommand(pythonCommand);
        this.scriptPath = resolveScriptPath(scriptPath);
        this.outputDir = outputDir;
        this.processTimeout = Duration.ofMillis(timeoutMs);
        this.objectMapper = objectMapper;

        this.dbUser = Optional.ofNullable(dataSourceProperties.getUsername()).orElse("");
        this.dbPassword = Optional.ofNullable(dataSourceProperties.getPassword()).orElse("");

        DatabaseParts parts = parseDatabaseParts(dataSourceProperties.getUrl());
        this.dbHost = parts.host();
        this.dbPort = parts.port();
        this.dbName = parts.database();
        
        // Log configuration at startup
        if (enabled) {
            System.out.println("Python Report Service initialized:");
            System.out.println("  Python command: " + this.pythonCommand);
            System.out.println("  Script path: " + this.scriptPath);
            System.out.println("  Output directory: " + this.outputDir);
            File scriptFile = new File(this.scriptPath);
            if (!scriptFile.exists()) {
                System.err.println("  WARNING: Python script not found at: " + this.scriptPath);
            } else {
                System.out.println("  Script exists: " + scriptFile.getAbsolutePath());
            }
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean supports(String type) {
        if (type == null) {
            return false;
        }
        return TYPE_MAP.containsKey(type.toLowerCase(Locale.ENGLISH));
    }

    public PythonReportResult generateReport(String reportId, String userId, String type) {
        if (!enabled) {
            throw new IllegalStateException("Python reporting is disabled.");
        }
        String mappedType = TYPE_MAP.get(type.toLowerCase(Locale.ENGLISH));
        if (!StringUtils.hasText(mappedType)) {
            throw new IllegalArgumentException("Unsupported Python report type: " + type);
        }

        // Verify script exists
        File scriptFile = new File(scriptPath);
        if (!scriptFile.exists()) {
            throw new IllegalStateException("Python script not found at: " + scriptPath + 
                ". Please ensure the script exists and the path is correct.");
        }

        List<String> command = new ArrayList<>();
        command.add(pythonCommand);
        command.add(scriptPath);
        command.add("--report-id");
        command.add(reportId);
        command.add("--user-id");
        command.add(userId);
        command.add("--report-type");
        command.add(mappedType);
        command.add("--db-host");
        command.add(dbHost);
        command.add("--db-port");
        command.add(String.valueOf(dbPort));
        command.add("--db-name");
        command.add(dbName);
        command.add("--db-user");
        command.add(dbUser);
        command.add("--db-password");
        command.add(dbPassword == null ? "" : dbPassword);
        command.add("--output-dir");
        command.add(outputDir);

        ProcessBuilder builder = new ProcessBuilder(command);
        
        // Set working directory to backend root (where scripts/ directory is)
        // The script path is already resolved to absolute, so we need to find backend root
        File workingDir = findBackendRoot(scriptFile);
        builder.directory(workingDir);
        
        // Use relative script path in command if we're in backend directory
        List<String> finalCommand = new ArrayList<>(command);
        if (scriptPath.contains("scripts") && workingDir.exists()) {
            // Replace absolute script path with relative path
            String relativeScript = "scripts" + File.separator + 
                scriptFile.getName().replace("\\", File.separator).replace("/", File.separator);
            finalCommand.set(1, relativeScript);
        }
        
        // Log the command for debugging
        System.out.println("Executing Python report generator:");
        System.out.println("  Command: " + String.join(" ", finalCommand));
        System.out.println("  Working directory: " + workingDir.getAbsolutePath());
        
        builder.command(finalCommand);

        try {
            Process process = builder.start();
            boolean finished = process.waitFor(processTimeout.toMillis(), java.util.concurrent.TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IllegalStateException("Python reporter timed out after " + processTimeout.toSeconds() + " seconds");
            }
            String output = processOutput(process);
            int exitCode = process.exitValue();
            
            System.out.println("Python script exit code: " + exitCode);
            System.out.println("Python script output:\n" + output);
            
            if (exitCode != 0) {
                throw new IllegalStateException("Python reporter failed with exit code " + exitCode + ":\n" + output);
            }
            
            // Try to find JSON in output (might have other output before/after)
            String jsonOutput = extractJsonFromOutput(output);
            if (jsonOutput == null || jsonOutput.trim().isEmpty()) {
                throw new IllegalStateException("Python reporter did not return valid JSON. Output: " + output);
            }
            
            JsonNode root = objectMapper.readTree(jsonOutput);
            String status = root.path("status").asText();
            if (!"success".equalsIgnoreCase(status)) {
                String message = root.path("message").asText("Report generation failed");
                throw new IllegalStateException(message);
            }
            String filename = root.path("filename").asText();
            if (filename == null || filename.isEmpty()) {
                throw new IllegalStateException("Python reporter did not return a filename");
            }
            Map<String, Object> data = objectMapper.convertValue(
                    root.path("data"),
                    new TypeReference<Map<String, Object>>() {}
            );
            return new PythonReportResult(filename, mappedType, data);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException("Failed to parse Python reporter JSON output: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Python reporter execution was interrupted: " + e.getMessage(), e);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to execute Python reporter: " + e.getMessage(), e);
        }
    }

    private String processOutput(Process process) throws IOException {
        String stdout = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        String stderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        if (StringUtils.hasText(stderr)) {
            stdout = stdout + (stdout.isEmpty() ? "" : System.lineSeparator()) + stderr;
        }
        return stdout;
    }

    /**
     * Extracts JSON from output that might contain other text before/after.
     * Looks for the last occurrence of { ... } that contains valid JSON.
     */
    private String extractJsonFromOutput(String output) {
        if (output == null || output.trim().isEmpty()) {
            return null;
        }
        
        // Try to find JSON object in output
        int lastBrace = output.lastIndexOf('}');
        if (lastBrace == -1) {
            return output.trim(); // No braces, return as-is
        }
        
        // Find matching opening brace
        int braceCount = 0;
        int startIdx = lastBrace;
        for (int i = lastBrace; i >= 0; i--) {
            char c = output.charAt(i);
            if (c == '}') {
                braceCount++;
            } else if (c == '{') {
                braceCount--;
                if (braceCount == 0) {
                    startIdx = i;
                    break;
                }
            }
        }
        
        String jsonCandidate = output.substring(startIdx, lastBrace + 1).trim();
        
        // Validate it's JSON by trying to parse it
        try {
            objectMapper.readTree(jsonCandidate);
            return jsonCandidate;
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            // If parsing fails, return the whole output trimmed
            return output.trim();
        }
    }

    private DatabaseParts parseDatabaseParts(String jdbcUrl) {
        if (!StringUtils.hasText(jdbcUrl)) {
            throw new IllegalStateException("DataSource URL is not configured");
        }
        Matcher matcher = MYSQL_URL.matcher(jdbcUrl);
        if (!matcher.matches()) {
            throw new IllegalStateException("Unsupported JDBC URL: " + jdbcUrl);
        }
        String host = matcher.group(1);
        String port = matcher.group(2) != null ? matcher.group(2) : "3306";
        String database = matcher.group(3);
        return new DatabaseParts(host, Integer.parseInt(port), database);
    }

    public record PythonReportResult(String filePath, String reportType, Map<String, Object> data) {
        public Map<String, Object> toContentMap() {
            Map<String, Object> content = new HashMap<>();
            content.put("filePath", filePath);
            content.put("reportType", reportType);
            content.put("reportEngine", "python");
            content.put("payload", data);
            return content;
        }

        public byte[] readFileBytes() throws IOException {
            return Files.readAllBytes(Path.of(filePath));
        }
    }

    private record DatabaseParts(String host, int port, String database) {}

    /**
     * Resolves the Python command path, auto-detecting venv if needed.
     * Supports both macOS/Linux and Windows paths.
     */
    private String resolvePythonCommand(String configuredCommand) {
        // If it's already an absolute path or contains path separators, use as-is
        if (configuredCommand.contains(File.separator) || configuredCommand.contains("/") || configuredCommand.contains("\\")) {
            File cmdFile = new File(configuredCommand);
            if (cmdFile.exists() && cmdFile.canExecute()) {
                return cmdFile.getAbsolutePath();
            }
            // Try to resolve relative to current directory
            File relativeFile = new File(".", configuredCommand);
            if (relativeFile.exists() && relativeFile.canExecute()) {
                return relativeFile.getAbsolutePath();
            }
        }

        // Auto-detect venv Python if command is "python3" or "python"
        if ("python3".equals(configuredCommand) || "python".equals(configuredCommand)) {
            String venvPython = findVenvPython();
            if (venvPython != null) {
                System.out.println("Auto-detected venv Python: " + venvPython);
                return venvPython;
            }
        }

        // Fall back to configured command (will be resolved by system PATH)
        return configuredCommand;
    }

    /**
     * Finds the venv Python interpreter, checking both Unix and Windows paths.
     */
    private String findVenvPython() {
        File currentDir = new File(".").getAbsoluteFile();
        
        // Check multiple possible locations relative to backend directory
        String[] possiblePaths = {
            // Unix-style (macOS/Linux)
            "scripts/venv/bin/python",
            "scripts/venv/bin/python3",
            "../scripts/venv/bin/python",
            "../scripts/venv/bin/python3",
            // Windows-style
            "scripts\\venv\\Scripts\\python.exe",
            "scripts\\venv\\Scripts\\python3.exe",
            "..\\scripts\\venv\\Scripts\\python.exe",
            "..\\scripts\\venv\\Scripts\\python3.exe",
            // Also check from backend directory if we're in a subdirectory
            "backend/scripts/venv/bin/python",
            "backend/scripts/venv/bin/python3",
            "backend\\scripts\\venv\\Scripts\\python.exe",
            "backend\\scripts\\venv\\Scripts\\python3.exe"
        };

        for (String path : possiblePaths) {
            File pythonFile = new File(currentDir, path);
            if (pythonFile.exists() && pythonFile.canExecute()) {
                return pythonFile.getAbsolutePath();
            }
        }

        return null;
    }

    /**
     * Finds the backend root directory by looking for scripts/ directory.
     */
    private File findBackendRoot(File scriptFile) {
        // Start from script file and walk up to find backend root
        File current = scriptFile.getAbsoluteFile();
        
        // Look for scripts/ directory in parent
        while (current != null && current.getParentFile() != null) {
            File scriptsDir = new File(current.getParentFile(), "scripts");
            if (scriptsDir.exists() && scriptsDir.isDirectory()) {
                return current.getParentFile(); // This is backend/
            }
            current = current.getParentFile();
        }
        
        // Fallback: try current directory
        File currentDir = new File(".").getAbsoluteFile();
        File scriptsDir = new File(currentDir, "scripts");
        if (scriptsDir.exists() && scriptsDir.isDirectory()) {
            return currentDir;
        }
        
        // Last resort: use script's parent's parent
        if (scriptFile.getParentFile() != null && scriptFile.getParentFile().getParentFile() != null) {
            return scriptFile.getParentFile().getParentFile();
        }
        
        return new File(".");
    }

    /**
     * Resolves the script path to an absolute path, handling both relative and absolute paths.
     */
    private String resolveScriptPath(String configuredPath) {
        File scriptFile = new File(configuredPath);
        
        // If absolute path and exists, use it
        if (scriptFile.isAbsolute() && scriptFile.exists()) {
            return scriptFile.getAbsolutePath();
        }

        // Try relative to current directory
        File currentDir = new File(".").getAbsoluteFile();
        File relativeFile = new File(currentDir, configuredPath);
        if (relativeFile.exists()) {
            return relativeFile.getAbsolutePath();
        }

        // Try from backend directory
        File backendScript = new File(currentDir, "backend/" + configuredPath);
        if (backendScript.exists()) {
            return backendScript.getAbsolutePath();
        }

        // Try with normalized separators
        String normalized = configuredPath.replace("\\", File.separator).replace("/", File.separator);
        File normalizedFile = new File(currentDir, normalized);
        if (normalizedFile.exists()) {
            return normalizedFile.getAbsolutePath();
        }

        // If not found, return as-is (will fail with clear error message)
        System.err.println("Warning: Python script not found at: " + configuredPath);
        return configuredPath;
    }
}

