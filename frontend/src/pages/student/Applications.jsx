import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors = {
  submitted: 'bg-slate-100 text-slate-700',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  offer_extended: 'bg-amber-100 text-amber-700',
  offer_accepted: 'bg-green-200 text-green-800',
  offer_declined: 'bg-slate-100 text-slate-600',
};

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my').then(({ data }) => setApplications(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleOffer = async (id, action) => {
    try {
      await api.patch(`/applications/${id}/offer`, { action });
      toast.success(action === 'accept' ? 'Offer accepted!' : 'Offer declined');
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status: action === 'accept' ? 'offer_accepted' : 'offer_declined' } : a)));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold">My Applications</h1>
        <Link to="/student/jobs" className="btn-primary">Browse Jobs</Link>
      </div>
      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">You haven't applied to any jobs yet.</p>
          <Link to="/student/jobs" className="btn-primary">Find Jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{app.job?.company?.companyName || 'Company'} - {app.job?.title}</h3>
                <p className="text-sm text-slate-500">Applied {format(new Date(app.appliedAt), 'PP')}</p>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-sm font-medium ${statusColors[app.status] || 'bg-slate-100'}`}>
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {app.status === 'interview_scheduled' && (
                  <Link to="/student/interviews" className="btn-secondary text-sm">View Interview</Link>
                )}
                {app.status === 'offer_extended' && (
                  <>
                    <button onClick={() => handleOffer(app._id, 'accept')} className="btn-primary text-sm">Accept</button>
                    <button onClick={() => handleOffer(app._id, 'decline')} className="btn-secondary text-sm">Decline</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
