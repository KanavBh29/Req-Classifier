import { useState, useEffect, useCallback } from 'react';
import { kpiAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-xl">
      <p className="text-base-content/60 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKPI = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kpiAPI.get();
      setKpi(res.data.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKPI(); }, [fetchKPI]);

  const radarData = kpi ? [
    { metric: 'FR Coverage', value: kpi.totalRequirements > 0 ? (kpi.functionalRequirements / kpi.totalRequirements * 100) : 0 },
    { metric: 'Traceability', value: kpi.traceabilityCoverage },
    { metric: 'Validation', value: kpi.validationCoverage },
    { metric: 'Clarity', value: kpi.totalRequirements > 0 ? ((1 - kpi.ambiguityRate / 100) * 100) : 0 },
    { metric: 'Test Coverage', value: kpi.totalRequirements > 0 ? Math.min((kpi.totalTestCases / kpi.totalRequirements) * 100, 100) : 0 },
  ] : [];

  const categoryData = kpi ? Object.entries(kpi.categories || {}).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-base-content/40 text-sm">Deep-dive quality metrics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl"></div>)}
        </div>
      ) : (
        <>
          {/* KPI summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Quality Score', value: kpi ? `${Math.round((kpi.traceabilityCoverage + kpi.validationCoverage + (100 - kpi.ambiguityRate)) / 3)}%` : '—', color: 'text-primary' },
              { label: 'Ambiguity Rate', value: kpi ? `${kpi.ambiguityRate}%` : '—', color: 'text-warning' },
              { label: 'FR/NFR Ratio', value: kpi?.nonFunctionalRequirements > 0 ? `${(kpi.functionalRequirements / kpi.nonFunctionalRequirements).toFixed(1)}:1` : '—', color: 'text-info' },
              { label: 'Coverage Gap', value: kpi ? `${(100 - kpi.traceabilityCoverage).toFixed(1)}%` : '—', color: 'text-error' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-base-content/80 mb-4">Quality Radar</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Radar name="Score" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Trend */}
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-base-content/80 mb-4">Requirement Intake Trend</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={kpi?.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} name="Total" />
                  <Line type="monotone" dataKey="ambiguous" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} name="Ambiguous" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            {categoryData.length > 0 && (
              <div className="glass-card">
                <h3 className="text-sm font-semibold text-base-content/80 mb-4">Requirements by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Coverage breakdown */}
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-base-content/80 mb-4">Coverage Overview</h3>
              <div className="space-y-4 mt-2">
                {[
                  { label: 'Traceability Coverage', value: kpi?.traceabilityCoverage || 0, color: '#7c3aed' },
                  { label: 'Validation Coverage', value: kpi?.validationCoverage || 0, color: '#10b981' },
                  { label: 'Requirement Clarity', value: kpi ? (100 - kpi.ambiguityRate) : 0, color: '#06b6d4' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-base-content/60">{item.label}</span>
                      <span className="font-mono" style={{ color: item.color }}>{item.value.toFixed(1)}%</span>
                    </div>
                    <div className="bg-base-300 rounded-full h-2">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, background: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
