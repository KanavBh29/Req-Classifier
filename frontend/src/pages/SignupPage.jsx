import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'analyst' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 mesh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center text-white font-bold text-xl shadow-2xl shadow-primary/40 mb-4">RT</div>
          <h1 className="text-2xl font-bold text-base-content">Create Account</h1>
          <p className="text-base-content/40 text-sm mt-1">Join your team on ReqTrace</p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label"><span className="label-text text-xs text-base-content/60">Full Name</span></label>
              <input type="text" placeholder="John Doe" required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs text-base-content/60">Email</span></label>
              <input type="email" placeholder="you@example.com" required className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs text-base-content/60">Password</span></label>
              <input type="password" placeholder="Min 6 characters" required className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs text-base-content/60">Role</span></label>
              <select className="select select-bordered bg-base-200/50 border-white/10 focus:border-primary/50 w-full" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary-glow w-full mt-2">
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-xs text-base-content/40 mt-4">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
