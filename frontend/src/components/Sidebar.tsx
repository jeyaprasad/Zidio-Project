import { getUser, logout } from "../lib/auth";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "⬛" },
  { label: "Employees", href: "/employees", icon: "👥" },
  { label: "Attendance", href: "/attendance", icon: "📅" },
  { label: "Payroll", href: "/payroll", icon: "💰" },
  { label: "Performance", href: "/performance", icon: "📊" },
  { label: "AI Insights", href: "/ai-insights", icon: "🤖" },
];

export function Sidebar() {
  const user = getUser();
  return (
    <aside className="w-56 min-h-screen border-r border-border flex flex-col bg-background sticky top-0">
      <div className="px-6 py-5 border-b border-border">
        <a href="/" className="font-display text-lg font-extrabold tracking-tighter">
          NEXUS<span className="text-primary">HR</span>
        </a>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <div className="text-xs font-medium text-foreground truncate">{user?.fullName}</div>
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{user?.role}</div>
        <button
          id="logout-btn"
          onClick={logout}
          className="mt-3 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
