import React from 'react';
import { CountUp } from '../components/CountUp';

interface LandingPageProps {
  onOpenAuth: () => void;
  theme?: 'dark' | 'light';
}

const FEATURES = [
  { icon: "👤", color: "rgba(91,110,245,0.15)", title: "Employee Lifecycle Management", desc: "End-to-end onboarding, offboarding, transfers, and contract management with automated workflows." },
  { icon: "📅", color: "rgba(0,200,180,0.12)", title: "Attendance & Leave Tracking", desc: "Real-time attendance tracking, flexible leave policies, and auto-approval workflows." },
  { icon: "💰", color: "rgba(251,191,36,0.12)", title: "Automated Payroll Processing", desc: "Statutory compliance, tax computations, and direct bank transfers with one-click approval." },
  { icon: "📊", color: "rgba(167,139,250,0.12)", title: "Performance Management", desc: "OKR/KPI frameworks, 360° reviews, continuous feedback loops, and calibration tools." },
  { icon: "🤖", color: "rgba(0,200,180,0.12)", title: "AI Attrition Prediction", desc: "AI-powered models analyze engagement signals to flag flight risks weeks in advance." },
  { icon: "📈", color: "rgba(91,110,245,0.15)", title: "Workforce Intelligence Dashboard", desc: "Role-based analytics with drill-down reports and executive-level snapshots." },
  { icon: "🔔", color: "rgba(251,191,36,0.12)", title: "Real-Time Notifications", desc: "Event-driven alerts for approvals, deadlines, policy changes, and compliance reminders." },
  { icon: "🛡️", color: "rgba(167,139,250,0.12)", title: "Role-Based Access Control", desc: "Granular RBAC with field-level permissions and audit trails." },
];

const SECURITY = [
  { title: "JWT Authentication", desc: "Stateless, short-lived tokens with refresh rotation" },
  { title: "OWASP Hardened", desc: "Input validation, XSS, CSRF & SQLi prevention" },
  { title: "CI/CD Pipelines", desc: "GitHub Actions with automated security scanning" },
  { title: "Prometheus & Grafana", desc: "Full observability stack with alert policies" },
  { title: "Kubernetes Deployment", desc: "Auto-scaling pods with rolling zero-downtime updates" },
  { title: "Redis Caching", desc: "Session store and rate-limiting with TTL policies" },
  { title: "PostgreSQL", desc: "ACID-compliant, encrypted at rest with point-in-time recovery" },
  { title: "Docker Containers", desc: "Immutable builds with multi-stage hardened images" },
];

const ARCH_LAYERS = [
  { label: "Frontend Layer", pills: [{ l: "React 19", c: "bg-indigo-500/10 border-indigo-500/35 text-indigo-300" }, { l: "TypeScript", c: "bg-indigo-500/10 border-indigo-500/35 text-indigo-300" }, { l: "Vite", c: "bg-indigo-500/10 border-indigo-500/35 text-indigo-300" }] },
  { label: "API Gateway", pills: [{ l: "Spring Boot 3", c: "bg-teal-500/10 border-teal-500/35 text-teal-300" }, { l: "Spring Security", c: "bg-teal-500/10 border-teal-500/35 text-teal-300" }, { l: "REST / WebSocket", c: "bg-teal-500/10 border-teal-500/35 text-teal-300" }] },
  { label: "AI Services", pills: [{ l: "Spring AI", c: "bg-indigo-500/10 border-indigo-500/35 text-indigo-300" }, { l: "Attrition Model", c: "bg-indigo-500/10 border-indigo-500/35 text-indigo-300" }, { l: "NLP Insights", c: "bg-indigo-500/10 border-indigo-500/35 text-indigo-300" }] },
  { label: "Data & Cache", pills: [{ l: "PostgreSQL", c: "bg-slate-500/10 border-slate-500/35 text-slate-300" }, { l: "Redis", c: "bg-slate-500/10 border-slate-500/35 text-slate-300" }, { l: "S3 Storage", c: "bg-slate-500/10 border-slate-500/35 text-slate-300" }] },
  { label: "Infrastructure", pills: [{ l: "Docker", c: "bg-slate-500/10 border-slate-500/35 text-slate-300" }, { l: "Kubernetes", c: "bg-slate-500/10 border-slate-500/35 text-slate-300" }, { l: "CI/CD", c: "bg-slate-500/10 border-slate-500/35 text-slate-300" }] },
];

const TECH = ["Java 21", "Spring Boot 3", "React 19", "TypeScript", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Spring AI", "Prometheus", "Grafana", "JWT Auth"];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, theme = 'dark' }) => {
  const techDouble = [...TECH, ...TECH];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className={`relative min-h-screen flex items-center px-[5%] py-24 overflow-hidden transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#080D1C]' : 'bg-slate-50'
      }`}>
        {/* Background Grids & Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(91,110,245,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(91,110,245,0.04)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute -top-[200px] -left-[200px] w-[700px] h-[700px] rounded-full bg-radial from-indigo-500/12 to-transparent pointer-events-none" />
        <div className="absolute -bottom-[150px] -right-[100px] w-[500px] h-[500px] rounded-full bg-radial from-teal-500/8 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-[640px]">
          <div className="inline-flex items-center gap-2 bg-indigo-500/12 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-400 tracking-wider mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            AI-Enabled · Java Full Stack · Production-Grade
          </div>
          <h1 className={`text-4xl md:text-6xl font-black leading-tight tracking-tight mb-5 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Enterprise HR,<br />
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              Intelligence-First
            </span>
          </h1>
          <p className={`text-base md:text-lg leading-relaxed mb-9 max-w-[520px] ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            NexusHR streamlines the complete employee lifecycle — from onboarding to attrition prediction — on a single, scalable platform built for modern enterprises.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <button
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/20"
              onClick={onOpenAuth}
            >
              Get Started
            </button>
            <button className={`px-7 py-3.5 bg-transparent border font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
              theme === 'dark' 
                ? 'border-white/10 text-white hover:bg-white/5 hover:border-white/20' 
                : 'border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400'
            }`}>
              <span>▶</span> Watch Demo
            </button>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col">
              <strong className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">5+</strong>
              <span className="text-xs text-slate-400 font-medium">Core HR Modules</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex flex-col">
              <strong className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">99.9%</strong>
              <span className="text-xs text-slate-400 font-medium">System Uptime SLA</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex flex-col">
              <strong className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">AI-powered</strong>
              <span className="text-xs text-slate-400 font-medium">Attrition Prediction</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup cards */}
        <div className="hidden lg:flex absolute right-[5%] top-1/2 -translate-y-1/2 w-[340px] z-10 flex-col gap-3">
          <div className={`border backdrop-blur-md rounded-xl p-4 flex items-center gap-3 animate-pulse ${
            theme === 'dark' ? 'bg-slate-900/80 border-white/5' : 'bg-white/80 border-slate-200 shadow-lg'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg">🤖</div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Attrition Signal</div>
              <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Active Flight Risk detected</div>
            </div>
            <div className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full text-red-400 bg-red-500/10">High</div>
          </div>

          <div className={`border backdrop-blur-md rounded-xl p-4 flex items-center gap-3 ${
            theme === 'dark' ? 'bg-slate-900/80 border-white/5' : 'bg-white/80 border-slate-200 shadow-lg'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center text-lg">📈</div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Payroll Run</div>
              <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>June Payroll Generated</div>
            </div>
            <div className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full text-teal-400 bg-teal-500/10">Paid</div>
          </div>
        </div>
      </div>

      {/* Sliding Tech Strip */}
      <div className="bg-slate-950 border-y border-white/5 py-5 overflow-hidden relative">
        <div className="flex gap-12 animate-marquee whitespace-nowrap width-max-content">
          {techDouble.map((t, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className={`px-[5%] py-24 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#080D1C]' : 'bg-slate-50 border-t border-slate-200'
      }`}>
        <div className="text-center md:text-left mb-14">
          <div className="text-[10px] font-bold text-teal-400 tracking-[3px] uppercase mb-3">Platform Features</div>
          <h2 className={`text-3xl md:text-4xl font-extrabold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>Everything HR. Nothing Redundant.</h2>
          <p className={`text-sm md:text-base max-w-[520px] leading-relaxed ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Eight integrated modules replacing fragmented point solutions — all under a unified data model with real-time sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`border rounded-2xl p-7 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 relative group overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-white/5 hover:border-indigo-500/30' 
                  : 'bg-white border-slate-200 hover:border-indigo-500/30 shadow-sm'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center text-xl" style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3 className={`text-base font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Stats */}
      <div className="mx-[5%] bg-gradient-to-br from-indigo-500/8 to-teal-500/5 border border-white/5 rounded-3xl px-8 py-16 md:px-16 md:py-20">
        <div className="text-center mb-12">
          <div className="text-[10px] font-bold text-teal-400 tracking-[3px] uppercase mb-3">Platform Impact</div>
          <h2 className="text-3xl font-extrabold text-white">
            Built for Scale, <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Proven in Production</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {[
            { n: 12, s: "k+", l: "Employee records managed" },
            { n: 99, s: ".9%", l: "System uptime guaranteed" },
            { n: 40, s: "%", l: "Reduction in HR overhead" },
            { n: 200, s: "ms", l: "Average API response time" },
          ].map((st, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent mb-2">
                <CountUp target={st.n} suffix={st.s} />
              </div>
              <div className="text-xs text-slate-400 font-medium">{st.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <section id="architecture" className="px-[5%] py-24 bg-[#080D1C]">
        <div className="text-center md:text-left mb-14">
          <div className="text-[10px] font-bold text-teal-400 tracking-[3px] uppercase mb-3">Technical Architecture</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Modern Stack, <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Enterprise-Ready</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 space-y-4 shadow-xl">
            {ARCH_LAYERS.map((layer, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{layer.label}</div>
                <div className="flex flex-wrap gap-2">
                  {layer.pills.map((p, j) => (
                    <span key={j} className={`px-3 py-1 border rounded-full text-xs font-semibold ${p.c}`}>
                      {p.l}
                    </span>
                  ))}
                </div>
                {i < ARCH_LAYERS.length - 1 && (
                  <div className="border-l border-dashed border-white/10 h-6 ml-4 my-1" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {[
              { icon: "⚡", bg: "bg-indigo-500/10 text-indigo-400", title: "Spring Boot 3 Backend", desc: "Modular microservice-ready architecture with Spring Security, Spring Data JPA, and WebSocket support." },
              { icon: "🧠", bg: "bg-teal-500/10 text-teal-400", title: "Spring AI Integration", desc: "LLM-powered attrition models and intelligent workforce recommendations." },
              { icon: "📦", bg: "bg-amber-500/10 text-amber-400", title: "Containerized Deployment", desc: "Docker images with Kubernetes orchestration ensuring zero-downtime deployments." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${item.bg}`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="px-[5%] py-24 bg-gradient-to-b from-[#080D1C] via-teal-950/5 to-[#080D1C] border-t border-white/5">
        <div className="text-center mb-14">
          <div className="text-[10px] font-bold text-teal-400 tracking-[3px] uppercase mb-3">Security & Infrastructure</div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Secure by Design, <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Compliant by Default</span></h2>
          <p className="text-slate-400 text-sm max-w-[520px] mx-auto leading-relaxed">
            NexusHR follows industry best practices across authentication, data protection, observability, and deployment reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECURITY.map((s, i) => (
            <div key={i} className="bg-slate-900 border border-white/5 rounded-xl p-5 flex gap-4 items-start">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <strong className="block text-white text-sm font-bold mb-1">{s.title}</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <div className="relative text-center px-[5%] py-28 overflow-hidden">
        <div className="absolute inset-0 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="text-[10px] font-bold text-teal-400 tracking-[3px] uppercase mb-3 relative">Get Started</div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-5 relative leading-tight">
          Ready to Transform<br />
          <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Your Workforce Operations?</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-[500px] mx-auto mb-8 relative leading-relaxed">
          Sign in to access the NexusHR dashboard and start managing your workforce.
        </p>
        <div className="flex justify-center gap-4 relative">
          <button
            className="px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg cursor-pointer transition-all shadow-lg hover:shadow-teal-500/20"
            onClick={onOpenAuth}
          >
            Sign In Now
          </button>
          <button className="px-7 py-3.5 bg-transparent border border-white/10 hover:border-white/20 text-white font-semibold rounded-lg cursor-pointer transition-all hover:bg-white/5">
            View on GitHub
          </button>
        </div>
      </div>
    </div>
  );
};
