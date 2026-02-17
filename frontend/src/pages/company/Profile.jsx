import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/companies/profile').then(({ data }) => {
      setProfile(data);
      setForm({
        companyName: data.companyName,
        industry: data.industry || '',
        website: data.website || '',
        description: data.description || '',
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        size: data.size || '',
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/companies/profile', form);
      toast.success('Profile updated');
      setProfile({ ...profile, ...form });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-2xl font-bold mb-6">Company Profile</h1>
      <form onSubmit={handleSave} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name</label>
            <input type="text" value={form.companyName || ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Industry</label>
            <input type="text" value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input" placeholder="IT, Finance, etc." />
          </div>
        </div>
        <div>
          <label className="label">Website</label>
          <input type="url" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input" placeholder="https://" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Contact Person</label>
            <input type="text" value={form.contactPerson || ''} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input type="email" value={form.contactEmail || ''} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input" required />
          </div>
        </div>
        <div>
          <label className="label">Contact Phone</label>
          <input type="tel" value={form.contactPhone || ''} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input" />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" rows={2} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Country</label>
            <input type="text" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Company Size</label>
          <select value={form.size || ''} onChange={(e) => setForm({ ...form, size: e.target.value })} className="input">
            <option value="">Select</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">Save Profile</button>
      </form>
    </div>
  );
}
