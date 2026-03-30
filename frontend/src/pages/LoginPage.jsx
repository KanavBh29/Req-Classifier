import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setForm({ email: 'demo@reqtrace.com', password: 'demo1234' });
  };

  return (
    <div className="min-h-screen bg-base-100 mesh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center text-white font-bold text-xl shadow-2xl shadow-primary/40 mb-4">RT</div>
          <h1 className="text-2xl font-bold text-base-content">Welcome to ReqTrace</h1>
          <p className="text-base-content/40 text-sm mt-1">ML-Powered Requirement Classification</p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label"><span className="label-text text-xs text-base-content/60">Email</span></label>
              <input
                type="email" placeholder="you@example.com" required
                className="input-field" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label"><span className="label-text text-xs text-base-content/60">Password</span></label>
              <input
                type="password" placeholder="••••••••" required
                className="input-field" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary-glow w-full mt-2">
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Sign In'}
            </button>
          </form>

          <div className="divider text-xs text-base-content/30">or</div>

          <button onClick={demoLogin} className="btn btn-outline btn-sm w-full border-white/10 hover:border-primary/50 text-xs">
            ⚡ Fill Demo Credentials
          </button>

          <p className="text-center text-xs text-base-content/40 mt-4">
            No account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
        </div>

        <p className="text-center text-xs text-base-content/20 mt-4">
          Demo: demo@reqtrace.com / demo1234
        </p>
      </div>
    </div>
  );
}
