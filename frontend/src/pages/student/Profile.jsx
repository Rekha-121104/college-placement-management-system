import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/students/profile').then(({ data }) => {
      setProfile(data);
      setForm({
        fullName: data.fullName,
        department: data.department,
        branch: data.branch || '',
        semester: data.semester || '',
        cgpa: data.cgpa || '',
        phone: data.phone || '',
        address: data.address || '',
        skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/students/profile', {
        ...form,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success('Profile updated');
      setProfile({ ...profile, ...form });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post('/students/profile/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded');
      setProfile({ ...profile, resume: data.resume });
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-2xl font-bold mb-6">My Profile</h1>
      <form onSubmit={handleSave} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Roll Number</label>
            <input type="text" value={profile?.rollNumber || ''} className="input bg-slate-100" disabled />
          </div>
          <div>
            <label className="label">Department</label>
            <input type="text" value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Branch</label>
            <input type="text" value={form.branch || ''} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Semester</label>
            <input type="number" value={form.semester || ''} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="input" min={1} max={10} />
          </div>
          <div>
            <label className="label">CGPA</label>
            <input type="number" step="0.01" value={form.cgpa || ''} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Phone</label>
          <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" rows={2} />
        </div>
        <div>
          <label className="label">Skills (comma-separated)</label>
          <input type="text" value={form.skills || ''} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="input" placeholder="JavaScript, React, Python" />
        </div>
        <div>
          <label className="label">Resume</label>
          <div className="flex items-center gap-4">
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="text-sm" />
            {profile?.resume && <a href={profile.resume} target="_blank" rel="noreferrer" className="text-primary-600 text-sm">View current resume</a>}
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">Save Profile</button>
      </form>
    </div>
  );
}
