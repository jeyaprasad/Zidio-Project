import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { apiFetch } from "../lib/auth";
import { Sidebar } from "../components/Sidebar";

export const Route = createFileRoute("/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: AiInsightsPage,
});

type InsightType = "attrition" | "skill-gap" | "engagement";

const INSIGHT_CONFIG: Record<InsightType, { label: string; icon: string; endpoint: string; responseKey: string; placeholder: string }> = {
  attrition: {
    label: "Attrition Prediction",
    icon: "⚠️",
    endpoint: "/api/ai/attrition",
    responseKey: "prediction",
    placeholder: `Employee: Jane Doe\nRole: Lead Engineer\nTenure: 4.2 years\nLast Review Rating: 2.8/5\nLeave Days Used: 28/30\nRecent Absences: 6 in last month\nSalary Change Last Year: 0%`,
  },
  "skill-gap": {
    label: "Skill Gap Analysis",
    icon: "📚",
    endpoint: "/api/ai/skill-gap",
    responseKey: "analysis",
    placeholder: `Employee: John Smith\nCurrent Role: Backend Developer\nTarget Role: Senior Backend Developer\nCurrent Skills: Java, Spring Boot, REST APIs\nYears Experience: 3\nLast Training: 18 months ago`,
  },
  engagement: {
    label: "Engagement Scoring",
    icon: "💡",
    endpoint: "/api/ai/engagement",
    responseKey: "score",
    placeholder: `Employee: Alice Chen\nAttendance Rate: 94%\nAvg Performance Rating: 4.1/5\nLeave Utilisation: 12/30 days\nTenure: 2.5 years\nFeedback Sentiment: Positive\nTeam: Product Engineering`,
  },
};

function AiInsightsPage() {
  const [activeTab, setActiveTab] = useState<InsightType>("attrition");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = INSIGHT_CONFIG[activeTab];

  async function runInsight() {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const res = await apiFetch(config.endpoint, {
        method: "POST",
        body: JSON.stringify({ data: input }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setResult(data[config.responseKey] ?? JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "AI service unavailable");
    } finally {
      setLoading(false);
    }
  }

  function loadExample() {
    setInput(config.placeholder);
    setResult("");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">F-05 · Spring AI</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">AI Workforce Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Powered by HuggingFace LLM — Attrition prediction, skill gap analysis, engagement scoring.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border border-border rounded-sm p-1 bg-secondary mb-6 w-fit">
          {(Object.entries(INSIGHT_CONFIG) as [InsightType, typeof config][]).map(([key, c]) => (
            <button
              key={key}
              id={`ai-tab-${key}`}
              onClick={() => { setActiveTab(key); setResult(""); setError(""); setInput(""); }}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                activeTab === key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-input" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Employee Data
              </label>
              <button
                id="ai-load-example"
                onClick={loadExample}
                className="text-xs text-primary hover:underline"
              >
                Load example →
              </button>
            </div>
            <textarea
              id="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors font-mono"
              placeholder={config.placeholder}
            />
            <button
              id="ai-run-btn"
              onClick={runInsight}
              disabled={loading || !input.trim()}
              className="w-full py-2.5 bg-foreground text-background text-sm font-semibold rounded-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Analysing…" : `Run ${config.label}`}
            </button>
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">AI Response</div>
            <div
              id="ai-output"
              className="min-h-[300px] border border-border rounded-sm p-4 bg-card text-sm leading-relaxed whitespace-pre-wrap"
            >
              {loading && <span className="text-muted-foreground animate-pulse">Generating insight…</span>}
              {error && <span className="text-destructive">{error}</span>}
              {!loading && !error && result && result}
              {!loading && !error && !result && (
                <span className="text-muted-foreground">Enter employee data and click Run to generate insight.</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
