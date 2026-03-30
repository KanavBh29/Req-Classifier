import { useState, useEffect, useCallback } from 'react';
import { kpiAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = { FR: '#10b981', NFR: '#3b82f6', ambiguous: '#f59e0b' };

const StatCard = ({ label, value, sub, color = 'primary', icon, loading }) => (
  <div className="stat-card">
    {loading ? (
      <div className="space-y-3">
        <div className="skeleton h-3 w-20"></div>
        <div className="skeleton h-8 w-16"></div>
        <div className="skeleton h-3 w-24"></div>
      </div>
    ) : (
      <>
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">{label}</span>
          <span className="text-lg">{icon}</span>
        </div>
        <p className={`text-3xl font-bold text-${color} mb-1`}>{value}</p>
        {sub && <p className="text-xs text-base-content/40">{sub}</p>}
      </>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs">
      <p className="text-base-content/60 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function DashboardPage() {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchKPI = useCallback(async () => {
    try {
      const res = await kpiAPI.get();
      setKpi(res.data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKPI(); }, [fetchKPI]);

  useEffect(() => {
    if (!socket) return;
    socket.on('kpi:refresh', fetchKPI);
    return () => socket.off('kpi:refresh', fetchKPI);
  }, [socket, fetchKPI]);

  const pieData = kpi ? [
    { name: 'Functional', value: kpi.functionalRequirements },
    { name: 'Non-Functional', value: kpi.nonFunctionalRequirements },
  ] : [];

  const coverageData = kpi ? [
    { name: 'Traceability', value: kpi.traceabilityCoverage, fill: '#7c3aed' },
    { name: 'Validation', value: kpi.validationCoverage, fill: '#10b981' },
    { name: 'FR Ratio', value: kpi.totalRequirements > 0 ? Math.round(kpi.functionalRequirements / kpi.totalRequirements * 100) : 0, fill: '#06b6d4' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Analytics Dashboard</h1>
        <p className="text-base-content/40 text-sm mt-1">Real-time requirement quality metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requirements" value={kpi?.totalRequirements ?? '—'} sub="All time" icon="◈" color="primary" loading={loading} />
        <StatCard label="Functional" value={kpi?.functionalRequirements ?? '—'} sub="FR requirements" icon="◉" color="success" loading={loading} />
        <StatCard label="Non-Functional" value={kpi?.nonFunctionalRequirements ?? '—'} sub="NFR requirements" icon="◎" color="info" loading={loading} />
        <StatCard label="Ambiguity Rate" value={kpi ? `${kpi.ambiguityRate}%` : '—'} sub={`${kpi?.ambiguousRequirements ?? 0} flagged`} icon="⚠" color="warning" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="Traceability Coverage" value={kpi ? `${kpi.traceabilityCoverage}%` : '—'} sub={`${kpi?.totalTraceLinks ?? 0} links`} icon="⟁" color="secondary" loading={loading} />
        <StatCard label="Validation Coverage" value={kpi ? `${kpi.validationCoverage}%` : '—'} sub={`${kpi?.validatedLinks ?? 0} validated`} icon="✓" color="success" loading={loading} />
        <StatCard label="Test Cases" value={kpi?.totalTestCases ?? '—'} sub="Total test cases" icon="◇" color="accent" loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FR vs NFR Pie */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-base-content/80 mb-4">FR vs NFR Distribution</h3>
          {loading ? <div className="skeleton h-48 w-full rounded-xl"></div> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  <Cell fill={COLORS.FR} />
                  <Cell fill={COLORS.NFR} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!loading && (
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>FR: {kpi?.functionalRequirements ?? 0}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>NFR: {kpi?.nonFunctionalRequirements ?? 0}
              </div>
            </div>
          )}
        </div>

        {/* Coverage Bar */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-base-content/80 mb-4">Coverage Metrics (%)</h3>
          {loading ? <div className="skeleton h-48 w-full rounded-xl"></div> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={coverageData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {coverageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ambiguity Trend */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-base-content/80 mb-4">Ambiguity Trend (7 Days)</h3>
          {loading ? <div className="skeleton h-48 w-full rounded-xl"></div> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kpi?.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2} dot={false} name="Total" />
                <Line type="monotone" dataKey="ambiguous" stroke="#f59e0b" strokeWidth={2} dot={false} name="Ambiguous" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick info */}
      {!loading && kpi && kpi.totalRequirements === 0 && (
        <div className="glass-card text-center py-12">
          <div className="text-5xl mb-4">◈</div>
          <h3 className="text-base font-semibold text-base-content/60">No requirements yet</h3>
          <p className="text-sm text-base-content/30 mt-1">Upload requirements to see analytics</p>
          <a href="/requirements" className="btn btn-primary btn-sm mt-4">Upload Requirements →</a>
        </div>
      )}
    </div>
  );
}
