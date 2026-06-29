import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";
import { Sidebar } from "../components/Sidebar";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: PerformancePage,
});

type Review = {
  id: number;
  employeeId: number;
  employeeName: string;
  reviewerName: string;
  reviewDate: string;
  rating: number;
  feedback: string;
  goals: string;
  status: string;
  sentiment: string;
};

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "text-green-600",
  NEGATIVE: "text-destructive",
  NEUTRAL: "text-muted-foreground",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-muted-foreground bg-muted border-border",
  SUBMITTED: "text-blue-600 bg-blue-50 border-blue-200",
  ACKNOWLEDGED: "text-yellow-600 bg-yellow-50 border-yellow-200",
  COMPLETED: "text-green-600 bg-green-50 border-green-200",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-primary" : "text-border"}>
          ★
        </span>
      ))}
    </div>
  );
}

function PerformancePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/performance?page=0&size=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load performance reviews");
        return r.json();
      })
      .then((d) => setReviews(Array.isArray(d) ? d : (d.content ?? [])))
      .catch((err) => {
        console.error(err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        <div className="mb-6">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">Reviews</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">360-degree reviews with AI sentiment analysis on feedback.</p>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading reviews…</div>
        ) : (
          <div className="space-y-4">
            {reviews.length === 0 && (
              <div className="border border-border rounded-sm p-8 text-center text-muted-foreground">
                No performance reviews found.
              </div>
            )}
            {reviews.map((r) => (
              <div key={r.id} className="border border-border rounded-sm p-5 bg-card hover:bg-card/80 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-semibold">{r.employeeName}</div>
                    <div className="text-xs text-muted-foreground">Reviewed by {r.reviewerName} · {r.reviewDate}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.sentiment && (
                      <span className={`font-mono text-[10px] font-bold uppercase ${SENTIMENT_COLORS[r.sentiment] ?? ""}`}>
                        {r.sentiment}
                      </span>
                    )}
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border uppercase font-bold ${STATUS_COLORS[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
                <StarRating rating={r.rating} />
                {r.feedback && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{r.feedback}</p>
                )}
                {r.goals && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Goals: </span>{r.goals}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
