import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">PlacementHub</h1>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>
        <div className="card animate-fade-in">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setTab('student')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${tab === 'student' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setTab('company')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${tab === 'company' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="mt-4 text-center text-slate-600 text-sm">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
