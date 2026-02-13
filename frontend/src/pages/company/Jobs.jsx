import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CompanyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'full-time', description: '', requirements: [], salary: {}, locations: [], workMode: 'onsite', openings: 1, skills: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/companies/jobs').then(({ data }) => setJobs(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/companies/jobs', {
        ...form,
        requirements: typeof form.requirements === 'string' ? form.requirements.split('\n').filter(Boolean) : form.requirements,
        skills: typeof form.skills === 'string' ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : form.skills,
      });
      toast.success('Job posted!');
      setShowForm(false);
      setForm({ title: '', type: 'full-time', description: '', requirements: [], locations: [], workMode: 'onsite', openings: 1, skills: [] });
      const { data } = await api.get('/companies/jobs');
      setJobs(data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold">Jobs</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Post Job'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h2 className="font-semibold">New Job</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={4} required />
          </div>
          <div>
            <label className="label">Requirements (one per line)</label>
            <textarea value={Array.isArray(form.requirements) ? form.requirements.join('\n') : form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="input" rows={3} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Openings</label>
              <input type="number" value={form.openings} onChange={(e) => setForm({ ...form, openings: +e.target.value })} className="input" min={1} />
            </div>
            <div>
              <label className="label">Work Mode</label>
              <select value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })} className="input">
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Skills (comma-separated)</label>
            <input type="text" value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="input" placeholder="React, Node.js, MongoDB" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">Post Job</button>
        </form>
      )}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job._id} className="card flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-slate-500 text-sm">{job.type} · {job.openings} opening(s) · {job.status}</p>
            </div>
            <Link to={`/company/applications/${job._id}`} className="btn-secondary text-sm">View Applications</Link>
          </div>
        ))}
        {jobs.length === 0 && !showForm && <div className="card text-center py-12 text-slate-500">No jobs posted. Click "Post Job" to add one.</div>}
      </div>
    </div>
  );
}
