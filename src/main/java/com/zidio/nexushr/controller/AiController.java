package com.zidio.nexushr.controller;

import com.zidio.nexushr.service.AiService;
import com.zidio.nexushr.service.HuggingFaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
// Note: @CrossOrigin removed — CORS handled globally in SecurityConfig
public class AiController {

    private final AiService aiService;
    private final HuggingFaceService huggingFaceService;

    // ─── F-05: Attrition Prediction ──────────────────────────────────────────
    @PostMapping("/attrition")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<?> getAttritionPrediction(@RequestBody Map<String, String> request) {
        String employeeData = request.getOrDefault("data", "");
        return ResponseEntity.ok(Map.of("prediction", aiService.predictAttrition(employeeData)));
    }

    // ─── F-05: Skill Gap Analysis ─────────────────────────────────────────────
    @PostMapping("/skill-gap")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<?> getSkillGapAnalysis(@RequestBody Map<String, String> request) {
        String employeeData = request.getOrDefault("data", "");
        return ResponseEntity.ok(Map.of("analysis", aiService.analyzeSkillGap(employeeData)));
    }

    // ─── F-05: Engagement Scoring ─────────────────────────────────────────────
    @PostMapping("/engagement")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<?> getEngagementScore(@RequestBody Map<String, String> request) {
        String employeeData = request.getOrDefault("data", "");
        return ResponseEntity.ok(Map.of("score", aiService.scoreEngagement(employeeData)));
    }

    // ─── Sentiment Analysis (internal, used by PerformanceService) ───────────
    @PostMapping("/sentiment")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<String> analyze(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(huggingFaceService.analyzeSentiment(request.getOrDefault("text", "")));
    }
}
