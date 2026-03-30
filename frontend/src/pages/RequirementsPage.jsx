import { useState, useEffect, useCallback } from 'react';
import { requirementAPI } from '../services/api';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const ClassifyModal = ({ onClose }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const classify = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await requirementAPI.classify(text);
      setResult(res.data.data);
    } catch { toast.error('Classification failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-lg animate-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base-content">Quick Classify</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">✕</button>
        </div>
        <textarea className="textarea textarea-bordered bg-base-200/50 border-white/10 w-full h-28 text-sm" placeholder="Enter a requirement text to classify..." value={text} onChange={e => setText(e.target.value)} />
        <button onClick={classify} disabled={loading || !text.trim()} className="btn-primary-glow w-full mt-3 btn-sm">
          {loading ? <span className="loading loading-spinner loading-xs"></span> : '⚡ Classify'}
        </button>
        {result && (
          <div className="mt-4 glass rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-base-content/50">Classification</span>
              <span className={`badge badge-sm ${result.type === 'FR' ? 'badge-fr' : 'badge-nfr'}`}>{result.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-base-content/50">Confidence</span>
              <span className="text-sm font-mono text-primary">{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            {result.ambiguityFlag && (
              <div>
                <span className="text-xs text-amber-400">⚠ Ambiguous terms: </span>
                <span className="text-xs text-base-content/60">{result.ambiguousTerms?.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RequirementCard = ({ req, onDelete }) => (
  <div className="glass rounded-xl p-4 hover:border-primary/30 border border-transparent transition-all duration-200 group">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs font-mono text-base-content/30">{req.requirementId}</span>
          <span className={req.classification === 'FR' ? 'badge-fr' : 'badge-nfr'}>{req.classification}</span>
          {req.ambiguityFlag && <span className="badge-ambiguous">⚠ Ambiguous</span>}
        </div>
        <p className="text-sm text-base-content/80 leading-relaxed">{req.text}</p>
        {req.ambiguousTerms?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {req.ambiguousTerms.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">{t}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-xs text-base-content/30">Confidence</span>
            <div className="flex-1 bg-base-300 rounded-full h-1 max-w-24">
              <div className="confidence-bar h-full rounded-full" style={{ width: `${(req.confidenceScore * 100).toFixed(0)}%` }}></div>
            </div>
            <span className="text-xs font-mono text-primary">{(req.confidenceScore * 100).toFixed(0)}%</span>
          </div>
          <span className="text-xs text-base-content/20">{new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <button onClick={() => onDelete(req._id)} className="btn btn-ghost btn-xs text-error/50 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
    </div>
  </div>
);

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterAmbig, setFilterAmbig] = useState(false);
  const [manualText, setManualText] = useState('');
  const [showClassify, setShowClassify] = useState(false);
  const [tab, setTab] = useState('list');

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requirementAPI.list({ page, limit: 15, search: search || undefined, classification: filterClass || undefined, ambiguity: filterAmbig || undefined });
      setRequirements(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load requirements'); }
    finally { setLoading(false); }
  }, [page, search, filterClass, filterAmbig]);

  useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

  const handleDelete = async (id) => {
    try {
      await requirementAPI.delete(id);
      toast.success('Requirement deleted');
      fetchRequirements();
    } catch { toast.error('Delete failed'); }
  };

  const handleManualSubmit = async () => {
    const lines = manualText.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return toast.error('Enter at least one requirement');
    setUploading(true);
    try {
      const res = await requirementAPI.upload({ requirements: lines, sourceFile: 'Manual Entry' });
      toast.success(`${res.data.count} requirements classified!`);
      setManualText('');
      setTab('list');
      fetchRequirements();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/plain': ['.txt'] },
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      setUploading(true);
      try {
        const res = await requirementAPI.upload({ requirements: lines, sourceFile: file.name });
        toast.success(`${res.data.count} requirements from ${file.name}`);
        setTab('list');
        fetchRequirements();
      } catch { toast.error('Upload failed'); }
      finally { setUploading(false); }
    }
  });

  return (
    <div className="space-y-6">
      {showClassify && <ClassifyModal onClose={() => setShowClassify(false)} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Requirements</h1>
          <p className="text-base-content/40 text-sm">{total} total requirements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowClassify(true)} className="btn btn-outline btn-sm border-white/10 hover:border-primary/50 text-xs">⚡ Quick Classify</button>
          <button onClick={() => setTab(tab === 'upload' ? 'list' : 'upload')} className="btn-primary-glow btn-sm">
            {tab === 'upload' ? '← Back' : '+ Upload'}
          </button>
        </div>
      </div>

      {tab === 'upload' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in">
          {/* Drag & Drop */}
          <div className="glass-card">
            <h3 className="font-semibold text-base-content mb-4 text-sm">Upload File (.txt)</h3>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/40'}`}>
              <input {...getInputProps()} />
              <div className="text-3xl mb-3">⬆</div>
              <p className="text-sm text-base-content/60">{isDragActive ? 'Drop here...' : 'Drag & drop a .txt file'}</p>
              <p className="text-xs text-base-content/30 mt-1">One requirement per line</p>
            </div>
          </div>

          {/* Manual entry */}
          <div className="glass-card">
            <h3 className="font-semibold text-base-content mb-4 text-sm">Manual Entry</h3>
            <textarea
              className="textarea textarea-bordered bg-base-200/50 border-white/10 w-full h-36 text-sm font-mono"
              placeholder={"The system shall...\nUsers must be able to...\nThe application should..."}
              value={manualText}
              onChange={e => setManualText(e.target.value)}
            />
            <p className="text-xs text-base-content/30 mt-2 mb-3">{manualText.split('\n').filter(l => l.trim()).length} requirements to classify</p>
            <button onClick={handleManualSubmit} disabled={uploading || !manualText.trim()} className="btn-primary-glow w-full btn-sm">
              {uploading ? <><span className="loading loading-spinner loading-xs"></span> Classifying...</> : '⚡ Classify & Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="glass-card !p-3 flex flex-wrap gap-3 items-center">
            <input
              type="text" placeholder="🔍 Search requirements..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input input-sm bg-base-200/50 border-white/10 flex-1 min-w-48 focus:border-primary/50"
            />
            <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }} className="select select-sm bg-base-200/50 border-white/10 focus:border-primary/50">
              <option value="">All Types</option>
              <option value="FR">Functional</option>
              <option value="NFR">Non-Functional</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-base-content/60 cursor-pointer">
              <input type="checkbox" className="toggle toggle-xs toggle-warning" checked={filterAmbig} onChange={e => { setFilterAmbig(e.target.checked); setPage(1); }} />
              Ambiguous only
            </label>
            <span className="text-xs text-base-content/30 ml-auto">{total} results</span>
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-24 w-full rounded-xl"></div>)
            ) : requirements.length === 0 ? (
              <div className="glass-card text-center py-16">
                <div className="text-5xl mb-4 opacity-20">◈</div>
                <p className="text-base-content/40 text-sm">No requirements found</p>
                <button onClick={() => setTab('upload')} className="btn btn-primary btn-sm mt-4">Upload Requirements</button>
              </div>
            ) : (
              requirements.map(req => <RequirementCard key={req._id} req={req} onDelete={handleDelete} />)
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`btn btn-xs ${page === i + 1 ? 'btn-primary' : 'btn-ghost border border-white/10'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
