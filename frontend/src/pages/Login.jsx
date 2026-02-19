import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiBriefcase } from 'react-icons/fi';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 via-blue-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 shadow-2xl shadow-primary-500/50 mb-4">
            <FiBriefcase className="text-white" size={40} />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">PlacementHub</h1>
          <p className="text-slate-300 text-lg">College Placement Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="glass card animate-scale-in backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-2 gradient-text">Welcome Back</h2>
          <p className="text-slate-600 text-sm mb-6">Sign in to continue to your dashboard</p>
          <div className="space-y-5">
            <div>
              <label className="label">Email Address</label>
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
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 py-3.5 text-base font-semibold">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
          <p className="mt-6 text-center text-slate-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
