package com.zidio.nexushr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatModel chatModel;

    // ─── F-05: Predictive Attrition ──────────────────────────────────────────
    public String predictAttrition(String employeeData) {
        String instruction = "You are an HR AI expert. Analyze the following employee metrics for attrition risk. "
                + "Respond with: 1) Risk Level: Low/Medium/High, 2) Key Risk Factors (3 bullets), "
                + "3) Recommended Retention Actions (3 bullets). "
                + "Be specific and actionable. Employee Data: " + employeeData;
        return callAi(instruction);
    }

    // ─── F-05: Skill Gap Analysis ─────────────────────────────────────────────
    public String analyzeSkillGap(String employeeData) {
        String instruction = "You are an HR talent development AI. Analyze the following employee profile and role requirements. "
                + "Identify: 1) Current Skills, 2) Required Skills for role advancement (3 skills), "
                + "3) Skill Gaps (missing or weak areas), 4) Recommended Learning Resources or Certifications. "
                + "Employee and Role Data: " + employeeData;
        return callAi(instruction);
    }

    // ─── F-05: Engagement Scoring ─────────────────────────────────────────────
    public String scoreEngagement(String employeeData) {
        String instruction = "You are an employee engagement specialist AI. Based on the following employee activity data "
                + "(attendance rate, performance review scores, leave usage, tenure, feedback sentiment), "
                + "provide: 1) Engagement Score (0-100), 2) Engagement Level: Disengaged/Neutral/Engaged/Highly Engaged, "
                + "3) Top 3 Engagement Drivers, 4) Top 3 Engagement Risks, 5) Recommended Actions. "
                + "Employee Data: " + employeeData;
        return callAi(instruction);
    }

    private String callAi(String instruction) {
        try {
            return chatModel.call(new Prompt(instruction))
                    .getResult()
                    .getOutput()
                    .getText();
        } catch (Exception e) {
            return "AI Inference unavailable: " + e.getMessage()
                    + "\n(Verify HF_API_KEY and HF_ENDPOINT_URL environment variables are set correctly)";
        }
    }
}
