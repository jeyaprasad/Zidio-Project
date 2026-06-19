import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch, type User } from '../services/api';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
}

type TabType = 'employees' | 'attendance' | 'payroll' | 'performance';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const showToast = (msg: string, isError = true) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const tabs: TabType[] = ['employees', 'attendance', 'payroll', 'performance'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        apiFetch<any[]>(`/${activeTab}`),
        apiFetch<Stats>('/dashboard/stats')
      ]);
      setData(res);
      setStats(statsRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await apiFetch<void>(`/${activeTab}/${id}`, { method: 'DELETE' });
      showToast('Deleted successfully', false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/${activeTab}/${editingId}` : `/${activeTab}`;
      await apiFetch<void>(url, {
        method,
        body: JSON.stringify(formData),
      });
      showToast(editingId ? 'Updated successfully' : 'Created successfully', false);
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save record');
    }
  };

  const openForm = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      // Generate blank fields based on active tab
      const schemas: Record<TabType, Record<string, string>> = {
        employees: { employeeId: '', firstName: '', lastName: '', email: '', department: '', position: '', status: 'ACTIVE' },
        attendance: { employeeId: '', date: '', checkIn: '', checkOut: '', status: 'PRESENT' },
        payroll: { employeeId: '', payPeriod: '', basicSalary: '', netSalary: '', status: 'PENDING' },
        performance: { employeeId: '', reviewerId: '', reviewDate: '', rating: '', feedback: '', status: 'SUBMITTED' }
      };
      setFormData(schemas[activeTab]);
    }
    setShowForm(true);
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      );
    }
    if (!data.length) {
      return <div className="text-center py-16 text-slate-500 text-sm">No records found.</div>;
    }

    const cols: Record<TabType, Array<{ key: string; label: string; render?: (val: any) => React.ReactNode }>> = {
      employees: [
        { key: 'employeeId', label: 'ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'department', label: 'Department' },
        { key: 'position', label: 'Position' },
        {
          key: 'status',
          label: 'Status',
          render: v => (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                v === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : v === 'PENDING'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {v}
            </span>
          ),
        },
      ],
      attendance: [
        { key: 'employeeName', label: 'Employee' },
        { key: 'date', label: 'Date' },
        { key: 'checkIn', label: 'Check In' },
        { key: 'checkOut', label: 'Check Out' },
        {
          key: 'status',
          label: 'Status',
          render: v => (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                v === 'PRESENT'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : v === 'LATE'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {v}
            </span>
          ),
        },
      ],
      payroll: [
        { key: 'employeeName', label: 'Employee' },
        { key: 'payPeriod', label: 'Period' },
        { key: 'basicSalary', label: 'Basic', render: v => `$${(v || 0).toLocaleString()}` },
        { key: 'netSalary', label: 'Net', render: v => `$${(v || 0).toLocaleString()}` },
        {
          key: 'status',
          label: 'Status',
          render: v => (
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                v === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {v}
            </span>
          ),
        },
      ],
      performance: [
        { key: 'employeeName', label: 'Employee' },
        { key: 'reviewerName', label: 'Reviewer' },
        { key: 'reviewDate', label: 'Date' },
        { key: 'rating', label: 'Rating' },
        { key: 'status', label: 'Status' },
        {
          key: 'sentiment',
          label: 'Sentiment (AI)',
          render: v => {
            if (!v) return <span className="text-slate-500">-</span>;
            const norm = v.toUpperCase();
            if (norm === 'POSITIVE') {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                  😊 Positive
                </span>
              );
            } else if (norm === 'NEGATIVE') {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400">
                  😢 Negative
                </span>
              );
            } else {
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400">
                  😐 Neutral
                </span>
              );
            }
          }
        }
      ],
    };

    const currentCols = cols[activeTab] || [];

    return (
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-slate-900/50">
            {currentCols.map(c => (
              <th key={c.key} className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">
                {c.label}
              </th>
            ))}
            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item, i) => (
            <tr key={item.id || i} className="hover:bg-white/[0.02] transition-colors">
              {currentCols.map(c => (
                <td key={c.key} className="px-6 py-3.5 text-slate-300">
                  {c.render ? c.render(item[c.key]) : item[c.key] ?? '-'}
                </td>
              ))}
              <td className="px-6 py-3.5">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-xs border border-white/10 hover:border-indigo-500 rounded bg-transparent hover:bg-indigo-500/10 text-slate-300 transition-all cursor-pointer"
                    onClick={() => openForm(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-xs border border-white/10 hover:border-red-500 rounded bg-transparent hover:bg-red-500/10 text-slate-300 transition-all cursor-pointer"
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

  return (
    <div className="min-h-screen bg-[#080D1C] px-[5%] py-24">
      {/* Messages */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-red-500/30 bg-red-950/20 px-5 py-4 text-xs font-semibold text-red-200 backdrop-blur-md shadow-2xl">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-4 text-xs font-semibold text-emerald-200 backdrop-blur-md shadow-2xl">
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">
            Welcome back, {user.fullName} · <span className="capitalize text-indigo-400 font-semibold">{user.role.toLowerCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/20 cursor-pointer transition-all"
            onClick={() => openForm()}
          >
            + New Record
          </button>
          <button
            className="px-5 py-2 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5 cursor-pointer transition-all"
            onClick={onLogout}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Employees</div>
          <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
            {stats?.totalEmployees ?? '-'}
          </div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active</div>
          <div className="text-3xl font-black text-emerald-400">
            {stats?.activeEmployees ?? '-'}
          </div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Present Today</div>
          <div className="text-3xl font-black text-teal-400">
            {stats?.presentToday ?? '-'}
          </div>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Absent Today</div>
          <div className="text-3xl font-black text-amber-400">
            {stats?.absentToday ?? '-'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === t
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                : 'border-white/5 hover:border-white/20 text-slate-400 hover:text-white bg-slate-950/20'
            }`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* AI Insights Playground for Performance Reviews */}
      {activeTab === 'performance' && (
        <div className="mb-8 p-6 bg-slate-900 border border-white/5 rounded-2xl text-left">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            🤖 Hugging Face AI Sentiment Analyzer Playground
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Test the live Hugging Face sentiment model (CardiffNLP RoBERTa) on any employee feedback text before saving.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <textarea
                placeholder="Type sample employee feedback here..."
                id="ai-playground-input"
                className="w-full h-24 rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 resize-none transition-colors"
              />
              <button
                type="button"
                onClick={async () => {
                  const inputEl = document.getElementById('ai-playground-input') as HTMLTextAreaElement;
                  const outputEl = document.getElementById('ai-playground-output');
                  if (!inputEl || !outputEl) return;
                  const val = inputEl.value.trim();
                  if (!val) {
                    alert('Please enter some text first');
                    return;
                  }
                  outputEl.innerText = 'Analyzing...';
                  try {
                    const res = await apiFetch<any>('/ai/sentiment', {
                      method: 'POST',
                      headers: { 'Content-Type': 'text/plain' },
                      body: val
                    });
                    
                    let display = '';
                    if (typeof res === 'string') {
                      try {
                        const parsed = JSON.parse(res);
                        display = JSON.stringify(parsed, null, 2);
                      } catch {
                        display = res;
                      }
                    } else {
                      display = JSON.stringify(res, null, 2);
                    }
                    outputEl.innerText = display;
                  } catch (err: any) {
                    outputEl.innerText = 'Error: ' + err.message;
                  }
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                Run Sentiment Analysis
              </button>
            </div>
            <div className="bg-slate-950/60 rounded-lg border border-white/5 p-4 overflow-auto max-h-32">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Analysis Result (Raw API Response)</div>
              <pre id="ai-playground-output" className="text-xs text-indigo-300 font-mono whitespace-pre-wrap">
                No analysis run yet. Type feedback on the left and run analysis.
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Form Dialog Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-2xl text-slate-400 cursor-pointer hover:text-white"
              onClick={() => setShowForm(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-extrabold text-white mb-6">
              {editingId ? 'Edit' : 'Create'} {activeTab.replace(/s$/, '').toUpperCase()}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(formData)
                .filter(([k]) => !['id', 'createdAt', 'updatedAt', 'employeeName', 'reviewerName'].includes(k))
                .map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </label>
                    <input
                      name={key}
                      value={val ?? ''}
                      onChange={e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                ))}

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer shadow-lg hover:shadow-indigo-500/20 transition-all"
              >
                {editingId ? 'Save Changes' : 'Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <div className="bg-slate-950/20 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">{renderTable()}</div>
      </div>
    </div>
  );
};
