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
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [addingCompany, setAddingCompany] = useState(false);

  useEffect(() => {
    api.get('/placement-drives').then(({ data }) => setDrives(data)).catch(console.error).finally(() => setLoading(false));
    api.get('/companies').then(({ data }) => setCompanies(data)).catch(() => {});
  }, []);

  const addCompanyToDrive = async (driveId, companyId) => {
    try {
      await api.post(`/placement-drives/${driveId}/companies`, { companyId });
      toast.success('Company added to drive');
      const { data } = await api.get('/placement-drives');
      setDrives(data);
      setSelectedDrive(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

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
              <div className="flex-1">
                <h3 className="font-semibold">{d.name}</h3>
                <p className="text-slate-500 text-sm">{format(new Date(d.startDate), 'PP')} - {format(new Date(d.endDate), 'PP')}</p>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-sm ${d.status === 'active' ? 'bg-green-100' : d.status === 'completed' ? 'bg-slate-100' : 'bg-blue-100'}`}>{d.status}</span>
                {d.companies?.length > 0 && (
                  <div className="mt-2 text-sm text-slate-600">
                    Companies: {d.companies.map((c) => c.companyName || c).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0 ml-4">
                <p className="text-sm text-slate-500 text-right">{d.companies?.length || 0} companies</p>
                <button onClick={() => setSelectedDrive(selectedDrive === d._id ? null : d._id)} className="btn-secondary text-sm">
                  {selectedDrive === d._id ? 'Cancel' : 'Add Company'}
                </button>
              </div>
            </div>
            {selectedDrive === d._id && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="label">Select Company</label>
                <select onChange={(e) => e.target.value && addCompanyToDrive(d._id, e.target.value)} className="input max-w-md">
                  <option value="">Choose a company...</option>
                  {companies.filter((c) => {
                    const driveCompanyIds = d.companies?.map((dc) => dc._id || dc.toString()) || [];
                    return !driveCompanyIds.includes(c._id);
                  }).map((c) => (
                    <option key={c._id} value={c._id}>{c.companyName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
        {drives.length === 0 && !showForm && <div className="card text-center py-12 text-slate-500">No placement drives. Create one to get started.</div>}
      </div>
    </div>
  );
}
