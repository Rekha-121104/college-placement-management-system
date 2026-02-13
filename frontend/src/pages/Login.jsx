import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(data.role === 'student' ? '/student' : data.role === 'company' ? '/company' : '/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">PlacementHub</h1>
          <p className="text-slate-400 mt-2">College Placement Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="card animate-fade-in">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-4 text-center text-slate-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
