import { useState, useEffect, useCallback } from 'react';
import { testCaseAPI, requirementAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { Validated: 'success', Pending: 'warning', Missing: 'error', Failed: 'error' };

const CreateModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ description: '', linkedRequirement: '', validationStatus: 'Pending' });
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requirementAPI.list({ limit: 100 }).then(res => setRequirements(res.data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await testCaseAPI.create({ ...form, linkedRequirement: form.linkedRequirement || undefined });
      toast.success('Test case created!');
      onCreated();
      onClose();
    } catch { toast.error('Creation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-lg animate-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">New Test Case</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">X</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label"><span className="label-text text-xs">Description</span></label>
            <textarea required className="textarea textarea-bordered bg-base-200/50 border-white/10 w-full h-24 text-sm" placeholder="Verify that..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label"><span className="label-text text-xs">Link to Requirement (optional)</span></label>
            <select className="select select-bordered bg-base-200/50 border-white/10 w-full text-sm" value={form.linkedRequirement} onChange={e => setForm({ ...form, linkedRequirement: e.target.value })}>
              <option value="">None</option>
              {requirements.map(r => <option key={r._id} value={r._id}>{r.requirementId}: {r.text.slice(0, 60)}...</option>)}
            </select>
          </div>
          <div>
            <label className="label"><span className="label-text text-xs">Status</span></label>
            <select className="select select-bordered bg-base-200/50 border-white/10 w-full text-sm" value={form.validationStatus} onChange={e => setForm({ ...form, validationStatus: e.target.value })}>
              <option>Pending</option><option>Validated</option><option>Missing</option><option>Failed</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary-glow w-full btn-sm">
            {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Create Test Case'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await testCaseAPI.list();
      setTestCases(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load test cases'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id) => {
    try { await testCaseAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await testCaseAPI.update(id, { validationStatus: status }); fetch(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetch} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Cases</h1>
          <p className="text-base-content/40 text-sm">{total} test cases</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary-glow btn-sm">New Test Case</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-xl"></div>)
        ) : testCases.length === 0 ? (
          <div className="glass-card text-center py-16">
            <p className="text-base-content/40 text-sm">No test cases yet</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm mt-4">Create Test Case</button>
          </div>
        ) : testCases.map(tc => (
          <div key={tc._id} className="glass rounded-xl p-4 hover:border-primary/30 border border-transparent transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-xs font-mono text-base-content/30">{tc.testCaseId}</span>
                  <span className={`badge badge-sm badge-${STATUS_COLORS[tc.validationStatus] || 'ghost'}`}>{tc.validationStatus}</span>
                  {tc.linkedRequirement && <span className="badge badge-sm bg-primary/20 text-primary border-primary/30">{tc.linkedRequirement.requirementId}</span>}
                </div>
                <p className="text-sm text-base-content/80">{tc.description}</p>
                <div className="flex gap-2 mt-3">
                  {['Validated', 'Pending', 'Missing'].map(s => (
                    <button key={s} onClick={() => handleStatusUpdate(tc._id, s)} className={`btn btn-xs ${tc.validationStatus === s ? `btn-${STATUS_COLORS[s]}` : 'btn-ghost border border-white/10'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => handleDelete(tc._id)} className="btn btn-ghost btn-xs text-error/50 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
