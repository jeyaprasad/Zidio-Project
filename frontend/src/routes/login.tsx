import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — NexusHR" },
      { name: "description", content: "Sign in to NexusHR Enterprise HR Platform" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && localStorage.getItem("nexushr_token")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = Route.useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegistering
        ? { email, password, fullName, role }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || (isRegistering ? "Registration failed" : "Invalid credentials"));
      }
      const data = await res.json();
      localStorage.setItem("nexushr_token", data.token);
      localStorage.setItem("nexushr_refresh", data.refreshToken);
      localStorage.setItem("nexushr_user", JSON.stringify({ email: data.email, fullName: data.fullName, role: data.role }));
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || (isRegistering ? "Registration failed" : "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="font-display text-2xl font-extrabold tracking-tighter">
            NEXUS<span className="text-primary">HR</span>
          </a>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegistering ? "Create your account" : "Sign in to your workspace"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          {error && (
            <div className="px-4 py-3 rounded-sm bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="space-y-1.5 animate-slide-up">
              <label htmlFor="fullName" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {isRegistering && (
            <div className="space-y-1.5 animate-slide-up">
              <label htmlFor="role" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-foreground"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="HR">HR</option>
                <option value="MANAGER">MANAGER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
              </select>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-foreground text-background text-sm font-semibold rounded-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? (isRegistering ? "Creating account…" : "Signing in…") : (isRegistering ? "Register" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="text-xs text-primary hover:underline cursor-pointer bg-transparent border-none outline-none"
          >
            {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2026 NexusHR Enterprise
        </p>
      </div>
    </div>
  );
}
