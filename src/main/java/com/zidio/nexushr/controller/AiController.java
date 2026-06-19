package com.zidio.nexushr.controller;

import com.zidio.nexushr.service.HuggingFaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final HuggingFaceService huggingFaceService;

    @PostMapping("/sentiment")
    public String analyze(@RequestBody String feedback) {
        return huggingFaceService.analyzeSentiment(feedback);
    }
}