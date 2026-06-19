package com.zidio.nexushr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatModel chatModel;

    public String predictAttrition(String employeeData) {
        String instruction = "Analyze the following employee metrics and history for attrition risk. "
                + "Provide a risk category (Low, Medium, High) and list 3 specific retention action bullet points. "
                + "Employee Data: " + employeeData;
        
        try {
            return chatModel.call(new Prompt(instruction))
                    .getResult()
                    .getOutput()
                    .getContent();
        } catch (Exception e) {
            return "AI Inference failed: " + e.getMessage() 
                    + "\n(Please verify your HF_API_KEY and HF_ENDPOINT_URL settings in application.yml)";
        }
    }
}
