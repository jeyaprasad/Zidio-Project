package com.zidio.nexushr.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ChatModel chatModel;

    // ─── F-05: Predictive Attrition ──────────────────────────────────────────
    public String predictAttrition(String employeeData) {
        String instruction = "You are an HR AI expert. Analyze the following employee metrics for attrition risk. "
                + "Respond with: 1) Risk Level: Low/Medium/High, 2) Key Risk Factors (3 bullets), "
                + "3) Recommended Retention Actions (3 bullets). "
                + "Be specific and actionable. Employee Data: " + employeeData;
        return callAi(instruction, "attrition", employeeData);
    }

    // ─── F-05: Skill Gap Analysis ─────────────────────────────────────────────
    public String analyzeSkillGap(String employeeData) {
        String instruction = "You are an HR talent development AI. Analyze the following employee profile and role requirements. "
                + "Identify: 1) Current Skills, 2) Required Skills for role advancement (3 skills), "
                + "3) Skill Gaps (missing or weak areas), 4) Recommended Learning Resources or Certifications. "
                + "Employee and Role Data: " + employeeData;
        return callAi(instruction, "skill-gap", employeeData);
    }

    // ─── F-05: Engagement Scoring ─────────────────────────────────────────────
    public String scoreEngagement(String employeeData) {
        String instruction = "You are an employee engagement specialist AI. Based on the following employee activity data "
                + "(attendance rate, performance review scores, leave usage, tenure, feedback sentiment), "
                + "provide: 1) Engagement Score (0-100), 2) Engagement Level: Disengaged/Neutral/Engaged/Highly Engaged, "
                + "3) Top 3 Engagement Drivers, 4) Top 3 Engagement Risks, 5) Recommended Actions. "
                + "Employee Data: " + employeeData;
        return callAi(instruction, "engagement", employeeData);
    }

    private String callAi(String instruction, String type, String employeeData) {
        try {
            return chatModel.call(new Prompt(instruction))
                    .getResult()
                    .getOutput()
                    .getText();
        } catch (Exception e) {
            log.warn("AI Inference call failed ({}). Using local simulated fallback.", e.getMessage());
            return generateSimulatedResponse(type, employeeData);
        }
    }

    private String generateSimulatedResponse(String type, String employeeData) {
        String data = employeeData != null ? employeeData.toLowerCase() : "";

        if ("attrition".equals(type)) {
            String riskLevel = "Low";
            String factor1 = "High workload and leave utilization.";
            String factor2 = "No salary adjustment in the last 12 months.";
            String factor3 = "Below average performance review rating.";

            if (data.contains("rating: 2") || data.contains("rating: 1") || data.contains("absences: 5") || data.contains("absences: 6") || data.contains("change last year: 0%")) {
                riskLevel = "High";
            } else if (data.contains("rating: 3") || data.contains("absences: 3") || data.contains("absences: 4")) {
                riskLevel = "Medium";
            }

            return "1) Risk Level: " + riskLevel + "\n\n"
                    + "2) Key Risk Factors:\n"
                    + "- " + factor1 + "\n"
                    + "- " + factor2 + "\n"
                    + "- " + factor3 + "\n\n"
                    + "3) Recommended Retention Actions:\n"
                    + "- Conduct a 1-on-1 career development check-in within the next 7 days.\n"
                    + "- Review compensation and align with current market rates.\n"
                    + "- Review project allocations to prevent burnout and ensure work-life balance.";
        } else if ("skill-gap".equals(type)) {
            return "1) Current Skills:\n"
                    + "- Core software development, OOP principles, and teamwork.\n\n"
                    + "2) Required Skills for role advancement:\n"
                    + "- System Design & Cloud Architecture (AWS/GCP)\n"
                    + "- Tech Leadership & Mentor Capabilities\n"
                    + "- CI/CD Pipeline & DevOps Automation\n\n"
                    + "3) Skill Gaps:\n"
                    + "- Limited experience in large-scale system design.\n"
                    + "- Needs exposure to cloud-native deployments and Kubernetes.\n\n"
                    + "4) Recommended Learning Resources:\n"
                    + "- Course: 'Designing Data-Intensive Applications' by Martin Kleppmann.\n"
                    + "- Certification: AWS Certified Solutions Architect - Associate.\n"
                    + "- Action: Pair-program with a Senior Architect on upcoming system design phases.";
        } else {
            int score = 78;
            String level = "Engaged";
            if (data.contains("rating: 2") || data.contains("rating: 1") || data.contains("absences: 5") || data.contains("absences: 6")) {
                score = 42;
                level = "Disengaged";
            } else if (data.contains("rating: 3") || data.contains("absences: 3")) {
                score = 61;
                level = "Neutral";
            } else if (data.contains("rating: 5")) {
                score = 92;
                level = "Highly Engaged";
            }

            return "1) Engagement Score: " + score + "/100\n\n"
                    + "2) Engagement Level: " + level + "\n\n"
                    + "3) Top 3 Engagement Drivers:\n"
                    + "- Strong alignment with team objectives.\n"
                    + "- Good technical autonomy in daily tasks.\n"
                    + "- Consistent attendance and participation.\n\n"
                    + "4) Top 3 Engagement Risks:\n"
                    + "- Potential fatigue due to high leave usage.\n"
                    + "- Lack of clear visibility into promotion criteria.\n"
                    + "- Sentiment dips on negative feedback.\n\n"
                    + "5) Recommended Actions:\n"
                    + "- Schedule a regular feedback loop to discuss career growth.\n"
                    + "- Recognize recent milestones publicly in team syncs.\n"
                    + "- Monitor workload and encourage taking scheduled breaks.";
        }
    }
}
