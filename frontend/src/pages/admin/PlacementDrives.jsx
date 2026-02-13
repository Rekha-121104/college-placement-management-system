import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminPlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', startDate: '', endDate: '', status: 'upcoming',
    eligibilityCriteria: { minCgpa: '', branches: '', maxBacklogs: '' },
  });
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get('/placement-drives').then(({ data }) => setDrives(data)).catch(console.error).finally(() => setLoading(false));
    api.get('/companies').then(({ data }) => setCompanies(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        eligibilityCriteria: {
          minCgpa: form.eligibilityCriteria.minCgpa ? parseFloat(form.eligibilityCriteria.minCgpa) : undefined,
          branches: form.eligibilityCriteria.branches ? form.eligibilityCriteria.branches.split(',').map((s) => s.trim()) : [],
          maxBacklogs: form.eligibilityCriteria.maxBacklogs ? parseInt(form.eligibilityCriteria.maxBacklogs) : undefined,
        },
      };
      await api.post('/placement-drives', payload);
      toast.success('Placement drive created!');
      setShowForm(false);
      const { data } = await api.get('/placement-drives');
      setDrives(data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold">Placement Drives</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Create Drive'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h2 className="font-semibold">New Placement Drive</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" required />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Min CGPA</label>
              <input type="number" step="0.1" value={form.eligibilityCriteria.minCgpa} onChange={(e) => setForm({ ...form, eligibilityCriteria: { ...form.eligibilityCriteria, minCgpa: e.target.value } })} className="input" />
            </div>
            <div>
              <label className="label">Branches (comma-separated)</label>
              <input type="text" value={form.eligibilityCriteria.branches} onChange={(e) => setForm({ ...form, eligibilityCriteria: { ...form.eligibilityCriteria, branches: e.target.value } })} className="input" placeholder="CSE, ECE, IT" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create</button>
        </form>
      )}
      <div className="space-y-4">
        {drives.map((d) => (
          <div key={d._id} className="card hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{d.name}</h3>
                <p className="text-slate-500 text-sm">{format(new Date(d.startDate), 'PP')} - {format(new Date(d.endDate), 'PP')}</p>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-sm ${d.status === 'active' ? 'bg-green-100' : d.status === 'completed' ? 'bg-slate-100' : 'bg-blue-100'}`}>{d.status}</span>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>{d.companies?.length || 0} companies</p>
              </div>
            </div>
          </div>
        ))}
        {drives.length === 0 && !showForm && <div className="card text-center py-12 text-slate-500">No placement drives. Create one to get started.</div>}
      </div>
    </div>
  );
}
