import { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { FiVideo, FiExternalLink } from 'react-icons/fi';

export default function CompanyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews/company').then(({ data }) => setInterviews(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) > new Date());
  const past = interviews.filter((i) => new Date(i.scheduledAt) <= new Date());

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Scheduled Interviews</h1>
      <div className="space-y-8">
        <div>
          <h2 className="font-semibold text-lg mb-4">Upcoming</h2>
          <div className="space-y-4">
            {upcoming.map((i) => (
              <div key={i._id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{i.student?.fullName} - {i.job?.title}</h3>
                  <p className="text-slate-500">{format(new Date(i.scheduledAt), 'EEEE, MMM d · h:mm a')}</p>
                  <p className="text-sm text-slate-600">{i.type} · {i.duration} min</p>
                </div>
                {i.meetingLink && (
                  <a href={i.meetingLink} target="_blank" rel="noreferrer" className="btn-primary flex items-center gap-2 w-fit">
                    <FiVideo size={18} />
                    Join Video Interview
                  </a>
                )}
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-slate-500">No upcoming interviews.</p>}
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-4">Past</h2>
          <div className="space-y-2">
            {past.map((i) => (
              <div key={i._id} className="card opacity-75 py-3">
                <p>{i.student?.fullName} - {i.job?.title} · {format(new Date(i.scheduledAt), 'PP')} · {i.status}</p>
              </div>
            ))}
            {past.length === 0 && <p className="text-slate-500">No past interviews.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
