import { useState, useEffect, useCallback } from 'react';
import { traceabilityAPI, requirementAPI, testCaseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const STATUS_BADGE = { Validated: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30', Missing: 'bg-red-500/20 text-red-400 border-red-500/30' };

const LinkModal = ({ onClose, onLinked }) => {
  const [form, setForm] = useState({ requirementId: '', testCaseId: '', validationStatus: 'Pending', notes: '' });
  const [requirements, setRequirements] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([requirementAPI.list({ limit: 100 }), testCaseAPI.list()]).then(([r, t]) => {
      setRequirements(r.data.data);
      setTestCases(t.data.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await traceabilityAPI.link(form);
      toast.success('Link created!');
      onLinked();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Link failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-lg animate-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Link Requirement to Test Case</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">X</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label"><span className="label-text text-xs">Requirement</span></label>
            <select required className="select select-bordered bg-base-200/50 border-white/10 w-full text-sm" value={form.requirementId} onChange={e => setForm({ ...form, requirementId: e.target.value })}>
              <option value="">Select Requirement</option>
              {requirements.map(r => <option key={r._id} value={r._id}>[{r.classification}] {r.requirementId}: {r.text.slice(0, 50)}...</option>)}
            </select>
          </div>
          <div>
            <label className="label"><span className="label-text text-xs">Test Case</span></label>
            <select required className="select select-bordered bg-base-200/50 border-white/10 w-full text-sm" value={form.testCaseId} onChange={e => setForm({ ...form, testCaseId: e.target.value })}>
              <option value="">Select Test Case</option>
              {testCases.map(t => <option key={t._id} value={t._id}>{t.testCaseId}: {t.description.slice(0, 60)}...</option>)}
            </select>
          </div>
          <div>
            <label className="label"><span className="label-text text-xs">Validation Status</span></label>
            <select className="select select-bordered bg-base-200/50 border-white/10 w-full text-sm" value={form.validationStatus} onChange={e => setForm({ ...form, validationStatus: e.target.value })}>
              <option>Pending</option><option>Validated</option><option>Missing</option>
            </select>
          </div>
          <div>
            <label className="label"><span className="label-text text-xs">Notes (optional)</span></label>
            <input type="text" className="input-field text-sm" placeholder="Add notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary-glow w-full btn-sm">
            {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Create Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function TraceabilityPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLink, setShowLink] = useState(false);
  const { socket } = useSocket();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await traceabilityAPI.list();
      setLinks(res.data.data);
    } catch { toast.error('Failed to load traceability'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    if (!socket) return;
    socket.on('traceability:linked', fetch);
    socket.on('traceability:updated', fetch);
    return () => { socket.off('traceability:linked', fetch); socket.off('traceability:updated', fetch); };
  }, [socket, fetch]);

  const handleDelete = async (id) => {
    try { await traceabilityAPI.delete(id); toast.success('Link removed'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await traceabilityAPI.update(id, { validationStatus: status }); fetch(); }
    catch { toast.error('Update failed'); }
  };

  // Build matrix view
  const reqs = [...new Map(links.map(l => [l.requirementId?._id, l.requirementId])).values()].filter(Boolean);
  const tcs = [...new Map(links.map(l => [l.testCaseId?._id, l.testCaseId])).values()].filter(Boolean);

  return (
    <div className="space-y-6">
      {showLink && <LinkModal onClose={() => setShowLink(false)} onLinked={fetch} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Traceability Matrix</h1>
          <p className="text-base-content/40 text-sm">{links.length} links across {reqs.length} requirements</p>
        </div>
        <button onClick={() => setShowLink(true)} className="btn-primary-glow btn-sm">+ Link</button>
      </div>

      {/* Matrix */}
      {!loading && reqs.length > 0 && tcs.length > 0 && (
        <div className="glass-card overflow-auto">
          <h3 className="text-sm font-semibold mb-4 text-base-content/70">Visual Matrix</h3>
          <div className="overflow-x-auto">
            <table className="text-xs min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 text-base-content/40 min-w-48">Requirement</th>
                  {tcs.map(tc => (
                    <th key={tc._id} className="p-2 text-base-content/40 min-w-28 text-center">{tc.testCaseId}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reqs.map(req => {
                  const reqLinks = links.filter(l => l.requirementId?._id === req._id);
                  return (
                    <tr key={req._id} className="border-t border-white/5">
                      <td className="p-2">
                        <div>
                          <span className="font-mono text-base-content/30">{req.requirementId}</span>
                          <p className="text-base-content/60 truncate max-w-44">{req.text}</p>
                        </div>
                      </td>
                      {tcs.map(tc => {
                        const link = reqLinks.find(l => l.testCaseId?._id === tc._id);
                        return (
                          <td key={tc._id} className="p-2 text-center">
                            {link ? (
                              <div className="flex justify-center">
                                <span className={`badge badge-xs border ${STATUS_BADGE[link.validationStatus] || ''}`}>
                                  {link.validationStatus === 'Validated' ? 'OK' : link.validationStatus === 'Pending' ? 'Pending' : 'Missing'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-base-content/10">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Links list */}
      <div className="space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-xl"></div>)
        ) : links.length === 0 ? (
          <div className="glass-card text-center py-16">
            <p className="text-base-content/40 text-sm">No traceability links yet</p>
            <button onClick={() => setShowLink(true)} className="btn btn-primary btn-sm mt-4">Create First Link</button>
          </div>
        ) : links.map(link => (
          <div key={link._id} className="glass rounded-xl p-4 border border-transparent hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <div className="glass rounded-lg px-3 py-2 flex-1 min-w-40">
                  <p className="text-xs text-base-content/40 mb-0.5">{link.requirementId?.requirementId}</p>
                  <p className="text-xs text-base-content/70 truncate">{link.requirementId?.text?.slice(0, 50)}...</p>
                </div>
                <span className="text-primary text-lg">to</span>
                <div className="glass rounded-lg px-3 py-2 flex-1 min-w-40">
                  <p className="text-xs text-base-content/40 mb-0.5">{link.testCaseId?.testCaseId}</p>
                  <p className="text-xs text-base-content/70 truncate">{link.testCaseId?.description?.slice(0, 50)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select value={link.validationStatus} onChange={e => handleStatusUpdate(link._id, e.target.value)} className={`select select-xs border text-xs ${STATUS_BADGE[link.validationStatus] || ''} bg-transparent`}>
                  <option>Validated</option><option>Pending</option><option>Missing</option>
                </select>
                <button onClick={() => handleDelete(link._id)} className="btn btn-ghost btn-xs text-error/50 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
