package com.subsentry.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Mock file upload implementation
            String fileName = file.getOriginalFilename();
            String fileId = "file-" + System.currentTimeMillis();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "fileId", fileId,
                "fileName", fileName,
                "size", file.getSize(),
                "url", "/uploads/" + fileId
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload file"));
        }
    }
    
    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileId) {
        try {
            // Mock file deletion implementation
            System.out.println("Deleting file: " + fileId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete file"));
        }
    }
}
