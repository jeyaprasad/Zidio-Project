import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";
import { Sidebar } from "../components/Sidebar";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: EmployeesPage,
});

type Employee = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-600 bg-green-50 border-green-200",
  ON_LEAVE: "text-yellow-600 bg-yellow-50 border-yellow-200",
  TERMINATED: "text-red-600 bg-red-50 border-red-200",
  SUSPENDED: "text-orange-600 bg-orange-50 border-orange-200",
};

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/api/employees?page=0&size=50")
      .then((r) => r.json())
      .then((d) => setEmployees(d.content ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.employeeId}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">Directory</div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Employees</h1>
          </div>
          <input
            id="employee-search"
            type="search"
            placeholder="Search by name, email, dept…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm bg-secondary border border-border rounded-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading employees…</div>
        ) : (
          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  {["ID", "Name", "Department", "Position", "Status", "Hire Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No employees found.
                    </td>
                  </tr>
                )}
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{emp.employeeId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                      <div className="text-xs text-muted-foreground">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.department || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.position || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border uppercase font-bold ${STATUS_COLORS[emp.status] ?? ""}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{emp.hireDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
