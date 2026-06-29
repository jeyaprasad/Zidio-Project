import { createFileRoute } from "@tanstack/react-router";

type Feature = { n: string; title: string; desc: string; featured?: boolean };

const FEATURES: Feature[] = [
  {
    n: "01",
    title: "Employee Lifecycle",
    desc: "Onboarding to offboarding automation with complete historical audit trails.",
  },
  {
    n: "02",
    title: "Attendance & Leave",
    desc: "Real-time time tracking with geo-fencing and automated policy enforcement.",
  },
  {
    n: "03",
    title: "Payroll Engine",
    desc: "Statutory compliance, tax computations, and direct bank transfers in one click.",
  },
  {
    n: "04",
    title: "Performance",
    desc: "360-degree reviews, OKR tracking, and continuous feedback loops.",
  },
  {
    n: "05",
    title: "AI Attrition",
    desc: "Predictive modeling that identifies flight risks before they become vacancies.",
    featured: true,
  },
  {
    n: "06",
    title: "Workforce Intel",
    desc: "Role-based analytics with drill-down reports and executive snapshots.",
  },
  {
    n: "07",
    title: "Notifications",
    desc: "Event-driven pub/sub system for critical HR alerts and observability.",
  },
  {
    n: "08",
    title: "RBAC Control",
    desc: "Granular row-level security with field permissions and full audit trails.",
  },
];

const TECH = [
  "JAVA 21",
  "SPRING BOOT 3",
  "REACT 19",
  "TYPESCRIPT",
  "POSTGRESQL",
  "REDIS",
  "DOCKER",
  "KUBERNETES",
  "SPRING AI",
  "PROMETHEUS",
  "GRAFANA",
  "JWT AUTH",
];

const INFRA = [
  "JWT Authentication with Refresh Rotation",
  "OWASP Hardened (XSS, CSRF, SQLi)",
  "GitHub Actions CI/CD with Security Scans",
  "Prometheus + Grafana Observability",
  "Auto-Scaling Kubernetes Cluster",
  "Redis Caching & Rate-Limiting",
  "PostgreSQL Encrypted at Rest",
  "Multi-Stage Hardened Docker Images",
];

const STATS = [
  { label: "RECORDS MANAGED", value: "12k+" },
  { label: "SYSTEM UPTIME", value: "99.9%" },
  { label: "OVERHEAD REDUCTION", value: "40%" },
  { label: "API LATENCY", value: "200ms" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusHR — Enterprise HR, Intelligence-First" },
      {
        name: "description",
        content:
          "Manage the complete employee lifecycle on a unified, AI-enabled, production-grade HR platform built on Java 21 and Spring AI.",
      },
      { property: "og:title", content: "NexusHR — Enterprise HR, Intelligence-First" },
      {
        property: "og:description",
        content:
          "Manage the complete employee lifecycle on a unified, AI-enabled, production-grade HR platform.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="font-display text-xl font-extrabold tracking-tighter">
              NEXUS<span className="text-primary">HR</span>
            </a>
            <div className="hidden md:flex gap-7 text-sm font-medium text-muted-foreground">
              <a href="#platform" className="hover:text-foreground transition-colors">
                Platform
              </a>
              <a href="#infrastructure" className="hover:text-foreground transition-colors">
                Infrastructure
              </a>
              <a href="#metrics" className="hover:text-foreground transition-colors">
                Metrics
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/login" id="signin-nav-btn" className="text-sm font-medium px-4 py-2 hover:bg-foreground/5 rounded-sm transition-colors">
              Sign In
            </a>
            <a href="/login" id="getstarted-nav-btn" className="text-sm font-medium bg-foreground text-background px-5 py-2 rounded-sm hover:bg-foreground/90 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-24 pb-24 border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/15 mb-10 animate-slide-up">
            <span className="size-1.5 bg-primary rounded-full animate-pulse-dot" />
            <span className="font-mono text-[10px] font-medium tracking-widest text-primary uppercase">
              AI-Enabled · Java Full Stack · Production-Grade
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-16 items-end">
            <div className="animate-slide-up [animation-delay:100ms]">
              <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tight text-balance leading-[0.9] mb-8">
                Enterprise HR,
                <br />
                Intelligence-First
              </h1>
              <p className="max-w-[50ch] text-lg text-muted-foreground text-pretty leading-relaxed mb-12">
                The unified architecture for the modern employee lifecycle. Built on Java 21 and
                Spring AI for performance-critical global workforce management.
              </p>
              <div className="flex flex-wrap items-end gap-12 mb-10">
                <div>
                  <div className="font-mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">
                    Modules
                  </div>
                  <div className="text-2xl font-display font-extrabold">5+ Core</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="font-mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">
                    Uptime
                  </div>
                  <div className="text-2xl font-display font-extrabold">99.9%</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="font-mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">
                    ML Logic
                  </div>
                  <div className="text-2xl font-display font-extrabold">AI-Powered</div>
                </div>
              </div>
              <a href="/login" id="hero-cta-btn" className="inline-block text-sm font-medium bg-foreground text-background px-6 py-3 rounded-sm hover:bg-foreground/90 transition-colors">
                Get Started
              </a>
            </div>

            {/* Floating mock cards */}
            <div className="relative animate-slide-up [animation-delay:300ms] hidden lg:block">
              <div className="bg-card ring-1 ring-border shadow-2xl p-5 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold"
                    style={{
                      color: "var(--color-signal-risk)",
                      background: "color-mix(in oklab, var(--color-signal-risk) 12%, transparent)",
                    }}
                  >
                    High Flight Risk
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">ID: #4920</span>
                </div>
                <div className="text-sm font-bold mb-1">Attrition Signal</div>
                <div className="text-xs text-muted-foreground mb-4">
                  Lead Engineer · 4.2 years tenure
                </div>
                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className="h-full w-[88%]"
                    style={{ background: "var(--color-signal-risk)" }}
                  />
                </div>
              </div>
              <div className="bg-card ring-1 ring-border shadow-xl p-5 rounded-lg translate-x-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-mono font-bold text-xs">$</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold">Payroll Run</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      JUNE 2026 · GENERATED
                    </div>
                  </div>
                  <span
                    className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold"
                    style={{
                      color: "var(--color-signal-ok)",
                      background: "color-mix(in oklab, var(--color-signal-ok) 14%, transparent)",
                    }}
                  >
                    Paid
                  </span>
                </div>
                <div className="text-lg font-display font-extrabold tracking-tight">
                  $1,248,390.00
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tech marquee */}
      <div className="py-6 bg-foreground text-background overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap w-max">
          {[...TECH, ...TECH].map((t, i) => (
            <span
              key={i}
              className="font-mono text-xs font-medium opacity-50 flex items-center gap-3"
            >
              <span className="size-1 rounded-full bg-background/40" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <section id="platform" className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-3">
            Platform Modules
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl">
            Everything HR. Nothing redundant.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 border-l border-t border-border">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className={`p-8 border-r border-b border-border transition-colors group ${
                f.featured ? "bg-primary/[0.04]" : "hover:bg-foreground/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[10px] text-primary">{f.n}</span>
                {f.featured ? (
                  <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
                    AI
                  </span>
                ) : null}
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section id="metrics" className="bg-foreground text-background py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="font-mono text-xs opacity-50 mb-3 tracking-widest">{s.label}</span>
              <span className="text-5xl font-display font-extrabold tracking-tighter">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Infrastructure */}
      <section id="infrastructure" className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-3">
            Security & Infrastructure
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Secure by design. Compliant by default.
          </h2>
          <p className="text-muted-foreground">
            Hardened from the database to the edge with zero-trust architecture and full
            observability.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
          {INFRA.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 border-t border-border pt-4"
            >
              <div className="size-3 mt-1.5 bg-primary flex-shrink-0" />
              <span className="text-sm font-medium leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-24 text-primary-foreground text-center px-6">
        <div className="max-w-3xl mx-auto">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-70 mb-5">
            Get Started
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-10 tracking-tight leading-tight">
            Deploy intelligence to your workforce.
          </h2>
          <div className="flex justify-center items-center">
            <button className="px-8 py-4 bg-background text-foreground text-sm font-bold rounded-sm hover:bg-background/90 transition-all">
              Get Started Now
            </button>
          </div>
          <p className="mt-10 font-mono text-[10px] opacity-70 uppercase tracking-[0.25em]">
            Spring Boot 3 + React 19 Engine
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display font-extrabold tracking-tighter">
            NEXUS<span className="text-primary">HR</span>
          </span>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            © 2026 NexusHR Platform · Enterprise Edition v4.2.0
          </div>
        </div>
      </footer>
    </div>
  );
}
