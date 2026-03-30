import { useState } from 'react';
import { reportAPI, kpiAPI } from '../services/api';
import toast from 'react-hot-toast';

const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const downloadCSV = (rows, headers, filename) => {
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] || ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const ReportCard = ({ title, description, icon, actions }) => (
  <div className="glass-card hover:border-primary/30 border border-transparent transition-all">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-base-content">{title}</h3>
        <p className="text-xs text-base-content/40 mt-1 mb-4">{description}</p>
        <div className="flex gap-2 flex-wrap">
          {actions.map((action, i) => (
            <button key={i} onClick={action.fn} disabled={action.loading} className={`btn btn-xs ${i === 0 ? 'btn-primary' : 'btn-outline border-white/10 hover:border-primary/50'}`}>
              {action.loading ? <span className="loading loading-spinner loading-xs"></span> : action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function ReportsPage() {
  const [loading, setLoading] = useState({});

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  const exportSRSJson = async () => {
    setLoad('srs-json', true);
    try {
      const res = await reportAPI.srs();
      downloadJSON(res.data.data, `srs-report-${Date.now()}.json`);
      toast.success('SRS report downloaded');
    } catch { toast.error('Export failed'); }
    finally { setLoad('srs-json', false); }
  };

  const exportSRSCsv = async () => {
    setLoad('srs-csv', true);
    try {
      const res = await reportAPI.srs();
      const all = [...(res.data.data.functional || []), ...(res.data.data.nonFunctional || [])];
      downloadCSV(all.map(r => ({ ID: r.requirementId, Type: r.classification, Text: r.text, Confidence: r.confidenceScore, Ambiguous: r.ambiguityFlag })), ['ID', 'Type', 'Text', 'Confidence', 'Ambiguous'], `srs-report-${Date.now()}.csv`);
      toast.success('SRS CSV downloaded');
    } catch { toast.error('Export failed'); }
    finally { setLoad('srs-csv', false); }
  };

  const exportTraceJson = async () => {
    setLoad('trace-json', true);
    try {
      const res = await reportAPI.traceability();
      downloadJSON(res.data.data, `traceability-report-${Date.now()}.json`);
      toast.success('Traceability report downloaded');
    } catch { toast.error('Export failed'); }
    finally { setLoad('trace-json', false); }
  };

  const exportTraceCsv = async () => {
    setLoad('trace-csv', true);
    try {
      const res = await reportAPI.traceability();
      const links = res.data.data.links || [];
      downloadCSV(
        links.map(l => ({ RequirementID: l.requirementId?.requirementId, Requirement: l.requirementId?.text?.slice(0, 80), TestCaseID: l.testCaseId?.testCaseId, TestCase: l.testCaseId?.description, Status: l.validationStatus })),
        ['RequirementID', 'Requirement', 'TestCaseID', 'TestCase', 'Status'],
        `traceability-${Date.now()}.csv`
      );
      toast.success('Traceability CSV downloaded');
    } catch { toast.error('Export failed'); }
    finally { setLoad('trace-csv', false); }
  };

  const exportKpiJson = async () => {
    setLoad('kpi-json', true);
    try {
      const res = await kpiAPI.get();
      downloadJSON({ ...res.data.data, generatedAt: new Date(), title: 'KPI Analytics Report' }, `kpi-report-${Date.now()}.json`);
      toast.success('KPI report downloaded');
    } catch { toast.error('Export failed'); }
    finally { setLoad('kpi-json', false); }
  };

  const copyLink = (path) => {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    toast.success('Link copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-base-content/40 text-sm">Export and share requirement analysis reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCard
          title="SRS Report"
          description="Software Requirements Specification — all FR and NFR requirements with classification details"
          icon="⊞"
          actions={[
            { label: '↓ JSON', fn: exportSRSJson, loading: loading['srs-json'] },
            { label: '↓ CSV', fn: exportSRSCsv, loading: loading['srs-csv'] },
            { label: '⧉ Copy Link', fn: () => copyLink('/reports') },
          ]}
        />
        <ReportCard
          title="Traceability Matrix"
          description="Complete requirement-to-test-case traceability mapping with validation status"
          icon="⟁"
          actions={[
            { label: '↓ JSON', fn: exportTraceJson, loading: loading['trace-json'] },
            { label: '↓ CSV', fn: exportTraceCsv, loading: loading['trace-csv'] },
            { label: '⧉ Copy Link', fn: () => copyLink('/traceability') },
          ]}
        />
        <ReportCard
          title="KPI Analytics Report"
          description="Quality metrics including ambiguity rate, traceability coverage, and validation statistics"
          icon="◇"
          actions={[
            { label: '↓ JSON', fn: exportKpiJson, loading: loading['kpi-json'] },
            { label: '⧉ Copy Link', fn: () => copyLink('/analytics') },
          ]}
        />

        {/* How-to */}
        <div className="glass-card border border-primary/20 bg-primary/5">
          <h3 className="font-semibold text-primary mb-2">📋 About Reports</h3>
          <ul className="space-y-1.5 text-xs text-base-content/60">
            <li>• <strong className="text-base-content/80">SRS Report</strong>: Export full requirements spec in JSON or CSV</li>
            <li>• <strong className="text-base-content/80">Traceability</strong>: Req-to-test case matrix for audit trails</li>
            <li>• <strong className="text-base-content/80">KPI Report</strong>: Analytics snapshot with all metrics</li>
            <li>• <strong className="text-base-content/80">Copy Link</strong>: Share read-only view with stakeholders</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
