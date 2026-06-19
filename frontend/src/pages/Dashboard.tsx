import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, type User } from '../services/api';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  theme?: 'dark' | 'light';
}

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
}

type TabType = 'employees' | 'attendance' | 'payroll' | 'leave' | 'performance';

// Map tab names to backend API endpoints
const TAB_API: Record<TabType, string> = {
  employees: '/employees',
  attendance: '/attendance',
  payroll: '/payroll',
  leave: '/leaves',
  performance: '/performance',
};

const TAB_LABELS: Record<TabType, string> = {
  employees: '👤 Employees',
  attendance: '🕐 Attendance',
  payroll: '💰 Payroll',
  leave: '🏖 Leave',
  performance: '⭐ Performance',
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, theme = 'dark' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [pdfLoading, setPdfLoading] = useState<number | null>(null);

  const isDark = theme === 'dark';

  const showToast = (msg: string, isError = true) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const tabs: TabType[] = ['employees', 'attendance', 'payroll', 'leave', 'performance'];

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsRes = await apiFetch<Stats>('/dashboard/stats');
      setStats(statsRes);
    } catch {
      // stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setData([]);
    try {
      const res = await apiFetch<any[]>(TAB_API[activeTab]);
      setData(Array.isArray(res) ? res : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await apiFetch<void>(`${TAB_API[activeTab]}/${id}`, { method: 'DELETE' });
      showToast('Deleted successfully', false);
      fetchData();
      if (activeTab === 'employees') fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${TAB_API[activeTab]}/${editingId}`
        : TAB_API[activeTab];

      // Convert numeric string fields
      const payload = { ...formData };
      if (activeTab === 'payroll') {
        if (payload.basicSalary) payload.basicSalary = parseFloat(payload.basicSalary);
        if (payload.allowances) payload.allowances = parseFloat(payload.allowances);
        if (payload.deductions) payload.deductions = parseFloat(payload.deductions);
        if (payload.employeeId) payload.employeeId = parseInt(payload.employeeId);
      }
      if (activeTab === 'attendance' || activeTab === 'leave' || activeTab === 'performance') {
        if (payload.employeeId) payload.employeeId = parseInt(payload.employeeId);
      }
      if (activeTab === 'performance') {
        if (payload.reviewerId) payload.reviewerId = parseInt(payload.reviewerId);
        if (payload.rating) payload.rating = parseInt(payload.rating);
      }

      await apiFetch<void>(url, {
        method,
        body: JSON.stringify(payload),
      });
      showToast(editingId ? 'Updated successfully ✓' : 'Created successfully ✓', false);
      setShowForm(false);
      setEditingId(null);
      setFormData({});
      fetchData();
      if (activeTab === 'employees') fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to save record');
    }
  };

  const openForm = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ ...item });
    } else {
      setEditingId(null);
      const today = new Date().toISOString().split('T')[0];
      const schemas: Record<TabType, Record<string, string>> = {
        employees: {
          employeeId: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          hireDate: today,
          salary: '',
          status: 'ACTIVE',
        },
        attendance: {
          employeeId: '',
          date: today,
          checkIn: '09:00',
          checkOut: '18:00',
          status: 'PRESENT',
          notes: '',
        },
        payroll: {
          employeeId: '',
          payPeriod: '',
          basicSalary: '',
          allowances: '0',
          deductions: '0',
          payDate: today,
          status: 'PENDING',
        },
        leave: {
          employeeId: '',
          startDate: today,
          endDate: today,
          leaveType: 'ANNUAL',
          reason: '',
        },
        performance: {
          employeeId: '',
          reviewerId: '',
          reviewDate: today,
          rating: '3',
          feedback: '',
          goals: '',
        },
      };
      setFormData(schemas[activeTab]);
    }
    setShowForm(true);
  };

  const downloadPayslip = async (id: number) => {
    setPdfLoading(id);
    try {
      const token = localStorage.getItem('nexushr_token');
      const res = await fetch(`/api/payroll/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Payslip downloaded ✓', false);
    } catch (err: any) {
      showToast(err.message || 'Failed to download payslip');
    } finally {
      setPdfLoading(null);
    }
  };

  type ColDef = { key: string; label: string; render?: (val: any, row: any) => React.ReactNode };

  const cols: Record<TabType, ColDef[]> = {
    employees: [
      { key: 'employeeId', label: 'EMP ID' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'department', label: 'Department' },
      { key: 'position', label: 'Position' },
      { key: 'hireDate', label: 'Hire Date' },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            v === 'ACTIVE'
              ? 'bg-emerald-500/15 text-emerald-400'
              : v === 'ON_LEAVE'
              ? 'bg-blue-500/15 text-blue-400'
              : v === 'SUSPENDED'
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-red-500/15 text-red-400'
          }`}>{v}</span>
        ),
      },
    ],
    attendance: [
      { key: 'employeeName', label: 'Employee' },
      { key: 'date', label: 'Date' },
      { key: 'checkIn', label: 'Check In' },
      { key: 'checkOut', label: 'Check Out' },
      { key: 'notes', label: 'Notes' },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            v === 'PRESENT'
              ? 'bg-emerald-500/15 text-emerald-400'
              : v === 'LATE'
              ? 'bg-amber-500/15 text-amber-400'
              : v === 'HALF_DAY'
              ? 'bg-blue-500/15 text-blue-400'
              : 'bg-red-500/15 text-red-400'
          }`}>{v}</span>
        ),
      },
    ],
    payroll: [
      { key: 'employeeName', label: 'Employee' },
      { key: 'payPeriod', label: 'Period' },
      { key: 'basicSalary', label: 'Basic', render: (v) => `$${(v || 0).toLocaleString()}` },
      { key: 'allowances', label: 'Allowances', render: (v) => `$${(v || 0).toLocaleString()}` },
      { key: 'deductions', label: 'Deductions', render: (v) => `-$${(v || 0).toLocaleString()}` },
      { key: 'netSalary', label: 'Net Pay', render: (v) => <span className="font-bold text-emerald-400">${(v || 0).toLocaleString()}</span> },
      { key: 'payDate', label: 'Pay Date' },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            v === 'PAID' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
          }`}>{v}</span>
        ),
      },
      {
        key: '_payslip',
        label: 'Payslip',
        render: (_v, row) => (
          <button
            onClick={() => downloadPayslip(row.id)}
            disabled={pdfLoading === row.id}
            className="px-3 py-1 text-xs rounded border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 cursor-pointer transition-all disabled:opacity-50"
          >
            {pdfLoading === row.id ? '...' : '⬇ PDF'}
          </button>
        ),
      },
    ],
    leave: [
      { key: 'employeeName', label: 'Employee' },
      { key: 'leaveType', label: 'Type' },
      { key: 'startDate', label: 'From' },
      { key: 'endDate', label: 'To' },
      { key: 'reason', label: 'Reason' },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            v === 'APPROVED'
              ? 'bg-emerald-500/15 text-emerald-400'
              : v === 'PENDING'
              ? 'bg-amber-500/15 text-amber-400'
              : v === 'REJECTED' || v === 'CANCELLED'
              ? 'bg-red-500/15 text-red-400'
              : 'bg-slate-500/15 text-slate-400'
          }`}>{v}</span>
        ),
      },
    ],
    performance: [
      { key: 'employeeName', label: 'Employee' },
      { key: 'reviewerName', label: 'Reviewer' },
      { key: 'reviewDate', label: 'Date' },
      {
        key: 'rating',
        label: 'Rating',
        render: (v) => (
          <span className="font-bold text-amber-400">
            {'★'.repeat(Math.min(v || 0, 5))}{'☆'.repeat(Math.max(0, 5 - (v || 0)))}
          </span>
        ),
      },
      { key: 'feedback', label: 'Feedback' },
      { key: 'goals', label: 'Goals' },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            v === 'COMPLETED'
              ? 'bg-emerald-500/15 text-emerald-400'
              : v === 'SUBMITTED'
              ? 'bg-blue-500/15 text-blue-400'
              : v === 'ACKNOWLEDGED'
              ? 'bg-indigo-500/15 text-indigo-400'
              : 'bg-slate-500/15 text-slate-400'
          }`}>{v}</span>
        ),
      },
    ],
  };

  const currentCols = cols[activeTab] || [];

  const hiddenFormKeys = ['id', 'createdAt', 'updatedAt', 'employeeName', 'reviewerName', 'netSalary', 'duration'];

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading data…</span>
        </div>
      );
    }
    if (!data.length) {
      return (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📭</div>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No records found. Create one to get started.</p>
        </div>
      );
    }

    return (
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className={`border-b ${isDark ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
            {currentCols.map(c => (
              <th key={c.key} className={`px-5 py-3.5 font-bold text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {c.label}
              </th>
            ))}
            <th className={`px-5 py-3.5 font-bold text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
          {data.map((item, i) => (
            <tr key={item.id ?? i} className={`transition-colors ${isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50'}`}>
              {currentCols.map(c => (
                <td key={c.key} className={`px-5 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'} max-w-[200px] truncate`}>
                  {c.render ? c.render(item[c.key], item) : (item[c.key] ?? '—')}
                </td>
              ))}
              <td className="px-5 py-3">
                <div className="flex gap-1.5">
                  <button
                    className={`px-3 py-1 text-xs border rounded cursor-pointer transition-all ${
                      isDark
                        ? 'border-white/10 hover:border-indigo-400 hover:bg-indigo-500/10 text-slate-300'
                        : 'border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 text-slate-700'
                    }`}
                    onClick={() => openForm(item)}
                  >
                    Edit
                  </button>
                  <button
                    className={`px-3 py-1 text-xs border rounded cursor-pointer transition-all ${
                      isDark
                        ? 'border-white/10 hover:border-red-400 hover:bg-red-500/10 text-slate-300'
                        : 'border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-700'
                    }`}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const statCards = [
    { label: 'Total Employees', value: stats?.totalEmployees, color: 'from-indigo-400 to-teal-400', icon: '👥' },
    { label: 'Active', value: stats?.activeEmployees, color: 'text-emerald-400', icon: '✅' },
    { label: 'Present Today', value: stats?.presentToday, color: 'text-teal-400', icon: '🟢' },
    { label: 'Absent Today', value: stats?.absentToday, color: 'text-amber-400', icon: '🔴' },
  ];

  return (
    <div className={`min-h-screen pt-20 pb-12 px-[5%] transition-colors duration-200 ${isDark ? 'bg-[#080D1C]' : 'bg-slate-50'}`}>
      {/* Toast Notifications */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-red-500/30 bg-red-950/90 px-5 py-4 text-xs font-semibold text-red-200 backdrop-blur-md shadow-2xl max-w-sm">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-5 py-4 text-xs font-semibold text-emerald-200 backdrop-blur-md shadow-2xl max-w-sm">
          ✓ {successMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            HR Dashboard
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Welcome back, <span className="font-semibold text-indigo-400">{user.fullName}</span>
            {' '}· <span className="capitalize">{user.role.toLowerCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/20 cursor-pointer transition-all"
            onClick={() => openForm()}
          >
            + New Record
          </button>
          <button
            className={`px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
              isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            onClick={onLogout}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`border rounded-2xl p-5 ${isDark ? 'bg-slate-900/80 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
              <span className="text-lg">{card.icon}</span>
            </div>
            {statsLoading ? (
              <div className="h-8 w-16 rounded bg-slate-800/50 animate-pulse" />
            ) : (
              <div className={`text-3xl font-black ${card.color.startsWith('from') ? `bg-gradient-to-r ${card.color} bg-clip-text text-transparent` : card.color}`}>
                {card.value ?? '—'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => (
          <button
            key={t}
            id={`tab-${t}`}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border transition-all ${
              activeTab === t
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : isDark
                ? 'border-white/5 hover:border-white/15 text-slate-400 hover:text-white bg-slate-950/30'
                : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-white'
            }`}
            onClick={() => setActiveTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-slate-950/30 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">{renderTable()}</div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className={`relative w-full max-w-lg rounded-2xl border p-8 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
          }`}>
            <button
              className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-lg cursor-pointer transition-all ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
              onClick={() => { setShowForm(false); setEditingId(null); setFormData({}); }}
            >
              ×
            </button>
            <h2 className={`text-lg font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {editingId ? '✏️ Edit' : '➕ Create'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {activeTab === 'payroll' && 'Net salary is auto-calculated: Basic + Allowances − Deductions.'}
              {activeTab === 'leave' && 'Leave balance is validated server-side against remaining days.'}
              {activeTab === 'performance' && 'Rating: 1 (Poor) to 5 (Excellent).'}
              {activeTab === 'employees' && 'Leave hireDate blank to default to today.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(formData)
                .filter(([k]) => !hiddenFormKeys.includes(k))
                .map(([key, val]) => {
                  const isSelect =
                    (key === 'status' && activeTab === 'employees') ||
                    (key === 'status' && activeTab === 'attendance') ||
                    (key === 'status' && activeTab === 'payroll') ||
                    (key === 'leaveType') ||
                    (key === 'status' && activeTab === 'performance');

                  const isTextarea = key === 'feedback' || key === 'goals' || key === 'reason' || key === 'notes';

                  const selectOpts: Record<string, string[]> = {
                    'status-employees': ['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED'],
                    'status-attendance': ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'],
                    'status-payroll': ['PENDING', 'PROCESSING', 'PAID', 'FAILED'],
                    'status-performance': ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED'],
                    leaveType: ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY'],
                  };

                  const optsKey = isSelect
                    ? (key === 'status' ? `status-${activeTab}` : key)
                    : '';
                  const opts = selectOpts[optsKey] || [];

                  const inputType =
                    (key.toLowerCase().includes('date') && !key.includes('update') && !key.includes('create'))
                      ? 'date'
                      : key === 'checkIn' || key === 'checkOut'
                      ? 'time'
                      : key === 'email'
                      ? 'email'
                      : key === 'salary' || key === 'basicSalary' || key === 'allowances' || key === 'deductions'
                      ? 'number'
                      : key === 'rating'
                      ? 'number'
                      : 'text';

                  const labelText = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, s => s.toUpperCase())
                    .trim();

                  const baseInput = `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
                    isDark
                      ? 'border-white/10 bg-slate-950 text-white focus:border-indigo-500 placeholder:text-slate-600'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500'
                  }`;

                  return (
                    <div key={key}>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {labelText}
                      </label>
                      {isSelect ? (
                        <select
                          name={key}
                          value={val ?? ''}
                          onChange={e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))}
                          className={baseInput}
                        >
                          {opts.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                        </select>
                      ) : isTextarea ? (
                        <textarea
                          name={key}
                          value={val ?? ''}
                          onChange={e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))}
                          rows={3}
                          className={`${baseInput} resize-none`}
                        />
                      ) : (
                        <input
                          type={inputType}
                          name={key}
                          value={val ?? ''}
                          min={key === 'rating' ? 1 : undefined}
                          max={key === 'rating' ? 5 : undefined}
                          step={key === 'salary' || key === 'basicSalary' || key === 'allowances' || key === 'deductions' ? '0.01' : undefined}
                          onChange={e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))}
                          className={baseInput}
                        />
                      )}
                    </div>
                  );
                })}

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold cursor-pointer shadow-lg hover:shadow-indigo-500/20 transition-all"
              >
                {editingId ? '💾 Save Changes' : '✓ Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
