import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NexusHR" },
      { name: "description", content: "NexusHR Admin Dashboard with real-time HR metrics" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardPage,
});

type Stats = {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
};

import { Sidebar, NAV_ITEMS } from "../components/Sidebar";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-border rounded-sm p-6 bg-card">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">{label}</div>
      <div className="text-4xl font-display font-extrabold tracking-tighter">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-2">{sub}</div>}
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError("Failed to load dashboard metrics"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">Overview</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Workforce Dashboard</h1>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground animate-pulse">Loading metrics…</div>
        )}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Employees" value={stats.totalEmployees} />
            <StatCard label="Active" value={stats.activeEmployees} sub="Currently employed" />
            <StatCard label="Present Today" value={stats.presentToday} sub="Clock-ins recorded" />
            <StatCard label="Absent Today" value={stats.absentToday} sub="No check-in" />
          </div>
        )}

        {/* Quick Links */}
        <div className="border-t border-border pt-8">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Quick Access</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {NAV_ITEMS.slice(1).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-4 border border-border rounded-sm hover:bg-foreground/[0.03] transition-colors group"
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">Manage →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


