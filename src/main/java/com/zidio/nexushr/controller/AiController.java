package com.zidio.nexushr.controller;

import com.zidio.nexushr.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/attrition")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAttritionPrediction(@RequestBody Map<String, String> request) {
        String employeeData = request.getOrDefault("data", "");
        String prediction = aiService.predictAttrition(employeeData);
        return ResponseEntity.ok(Map.of("prediction", prediction));
    }
}
