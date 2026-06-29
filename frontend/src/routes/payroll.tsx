import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/auth";
import { Sidebar } from "../components/Sidebar";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll — NexusHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("nexushr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: PayrollPage,
});

type PayrollRecord = {
  id: number;
  employeeName: string;
  payPeriod: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxAmount: number;
  netSalary: number;
  payDate: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
  PROCESSED: "text-blue-600 bg-blue-50 border-blue-200",
  PAID: "text-green-600 bg-green-50 border-green-200",
  CANCELLED: "text-red-600 bg-red-50 border-red-200",
};

function fmt(n: number | null | undefined) {
  if (n == null) return "$0.00";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/payroll?page=0&size=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load payroll");
        return r.json();
      })
      .then((d) => setRecords(Array.isArray(d) ? d : (d.content ?? [])))
      .catch((err) => {
        console.error(err);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  function downloadPayslip(id: number) {
    apiFetch(`/api/payroll/${id}/payslip`)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payslip-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(console.error);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        <div className="mb-6">
          <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">Compensation</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Payroll</h1>
          <p className="text-sm text-muted-foreground mt-1">Automated tax computation via progressive brackets. Monthly runs on the 28th.</p>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading payroll records…</div>
        ) : (
          <div className="border border-border rounded-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  {["Employee", "Pay Period", "Basic", "Allowances", "Tax", "Deductions", "Net Salary", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No payroll records found.</td>
                  </tr>
                )}
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium">{r.employeeName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.payPeriod}</td>
                    <td className="px-4 py-3 font-mono text-xs">{fmt(r.basicSalary)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-600">+{fmt(r.allowances)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-destructive">-{fmt(r.taxAmount)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-destructive">-{fmt(r.deductions)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold">{fmt(r.netSalary)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border uppercase font-bold ${STATUS_COLORS[r.status] ?? ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        id={`download-payslip-${r.id}`}
                        onClick={() => downloadPayslip(r.id)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        PDF ↓
                      </button>
                    </td>
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
