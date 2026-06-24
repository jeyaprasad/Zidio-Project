package com.zidio.nexushr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HuggingFaceService {

    @Value("${huggingface.api.token:}")
    private String token;

    @Value("${huggingface.api.url:https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public String analyzeSentiment(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "NEUTRAL";
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("inputs", text);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    request,
                    String.class);

            String responseBody = response.getBody();
            if (responseBody == null) {
                return "NEUTRAL";
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(responseBody);

            if (root.isArray() && root.size() > 0) {
                com.fasterxml.jackson.databind.JsonNode innerArray = root.get(0);
                if (innerArray.isArray() && innerArray.size() > 0) {
                    String topLabel = "";
                    double maxScore = -1.0;
                    for (com.fasterxml.jackson.databind.JsonNode node : innerArray) {
                        double score = node.path("score").asDouble();
                        if (score > maxScore) {
                            maxScore = score;
                            topLabel = node.path("label").asText();
                        }
                    }
                    String lowerLabel = topLabel.toLowerCase();
                    if (lowerLabel.contains("pos") || lowerLabel.equals("label_2")) {
                        return "POSITIVE";
                    } else if (lowerLabel.contains("neg") || lowerLabel.equals("label_0")) {
                        return "NEGATIVE";
                    } else {
                        return "NEUTRAL";
                    }
                }
            }
            return "NEUTRAL";
        } catch (Exception e) {
            System.err.println("Error calling Hugging Face API: " + e.getMessage());
            return "NEUTRAL";
        }
    }
}