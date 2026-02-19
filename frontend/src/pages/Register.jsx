import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiBriefcase, FiUser } from 'react-icons/fi';

export default function Register() {
  const [tab, setTab] = useState('student');
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', department: '', rollNumber: '',
    companyName: '', contactPerson: '', contactEmail: '', industry: '',
  });
  const [loading, setLoading] = useState(false);
  const { registerStudent, registerCompany } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'student') {
        await registerStudent({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          department: form.department,
          rollNumber: form.rollNumber || undefined,
        });
        toast.success('Registration successful!');
        navigate('/student');
      } else {
        await registerCompany({
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          contactPerson: form.contactPerson,
          contactEmail: form.contactEmail || form.email,
          industry: form.industry,
        });
        toast.success('Registration successful!');
        navigate('/company');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 via-blue-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background */}
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
          <p className="text-slate-300 text-lg">Create your account</p>
        </div>
        <div className="glass card animate-scale-in backdrop-blur-xl">
          <div className="flex gap-3 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTab('student')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                tab === 'student' 
                  ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FiUser size={18} />
              Student
            </button>
            <button
              type="button"
              onClick={() => setTab('company')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                tab === 'company' 
                  ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FiBriefcase size={18} />
              Company
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" minLength={6} required />
            </div>
            {tab === 'student' ? (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input" placeholder="e.g. CSE, ECE" required />
                </div>
                <div>
                  <label className="label">Roll Number (optional)</label>
                  <input type="text" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className="input" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label">Company Name</label>
                  <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Contact Person</label>
                  <input type="text" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Contact Email</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input" placeholder={form.email} />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input" placeholder="e.g. IT, Finance" />
                </div>
              </>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-6 text-base font-semibold">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-slate-600 text-sm">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
