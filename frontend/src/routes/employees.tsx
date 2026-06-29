import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getUser } from "../lib/auth";
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
  
  // Create Employee states
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [newEmp, setNewEmp] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    hireDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE",
  });

  const [user, setUser] = useState<{ role: string } | null>(null);
  const canCreate = user?.role === "ADMIN" || user?.role === "HR";

  useEffect(() => {
    setUser(getUser());
    apiFetch("/api/employees?page=0&size=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load employees");
        return r.json();
      })
      .then((d) => setEmployees(Array.isArray(d) ? d : (d.content ?? [])))
      .catch((err) => {
        console.error(err);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch("/api/employees", {
        method: "POST",
        body: JSON.stringify({
          ...newEmp,
          salary: newEmp.salary ? Number(newEmp.salary) : 0,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create employee");
      }
      const created = await res.json();
      setEmployees((prev) => [created, ...prev]);
      setIsAdding(false);
      setNewEmp({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        salary: "",
        hireDate: new Date().toISOString().split("T")[0],
        status: "ACTIVE",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create employee");
    }
  }

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
          <div className="flex items-center gap-3">
            <input
              id="employee-search"
              type="search"
              placeholder="Search by name, email, dept…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-sm bg-secondary border border-border rounded-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            />
            {canCreate && (
              <button
                onClick={() => {
                  setIsAdding(true);
                  setError("");
                }}
                className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-sm hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                + Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Create Employee Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-2xl p-6 relative">
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl cursor-pointer"
              >
                &times;
              </button>
              <h2 className="font-display text-xl font-extrabold mb-4">Add New Employee</h2>
              
              {error && (
                <div className="mb-4 px-4 py-3 rounded-sm bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Employee ID</label>
                    <input
                      type="text"
                      required
                      value={newEmp.employeeId}
                      onChange={(e) => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="EMP005"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Status</label>
                    <select
                      value={newEmp.status}
                      onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_LEAVE">ON_LEAVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="TERMINATED">TERMINATED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">First Name</label>
                    <input
                      type="text"
                      required
                      value={newEmp.firstName}
                      onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Last Name</label>
                    <input
                      type="text"
                      required
                      value={newEmp.lastName}
                      onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Email</label>
                    <input
                      type="email"
                      required
                      value={newEmp.email}
                      onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="jane.smith@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Phone</label>
                    <input
                      type="text"
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Department</label>
                    <input
                      type="text"
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Engineering"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Position</label>
                    <input
                      type="text"
                      value={newEmp.position}
                      onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="Senior Developer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Salary ($)</label>
                    <input
                      type="number"
                      value={newEmp.salary}
                      onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                      placeholder="90000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Hire Date</label>
                    <input
                      type="date"
                      required
                      value={newEmp.hireDate}
                      onChange={(e) => setNewEmp({ ...newEmp, hireDate: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2.5 text-sm font-medium hover:bg-secondary rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium bg-foreground text-background rounded-sm hover:bg-foreground/90 transition-colors cursor-pointer"
                  >
                    Save Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
