import { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { FiVideo, FiMapPin, FiPhone } from 'react-icons/fi';

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews/student').then(({ data }) => setInterviews(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const joinMeeting = (link) => {
    if (link) window.open(link, '_blank');
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) > new Date());
  const past = interviews.filter((i) => new Date(i.scheduledAt) <= new Date());

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold mb-6">My Interviews</h1>
      <div className="space-y-8">
        {upcoming.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-4">Upcoming</h2>
            <div className="space-y-4">
              {upcoming.map((i) => (
                <div key={i._id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{i.company?.companyName} - {i.job?.title}</h3>
                    <p className="text-slate-600 mt-1">{format(new Date(i.scheduledAt), 'EEEE, MMM d, yyyy · h:mm a')}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        {i.type === 'virtual' ? <FiVideo /> : i.type === 'in-person' ? <FiMapPin /> : <FiPhone />}
                        {i.type}
                      </span>
                      {i.location && <span>{i.location}</span>}
                    </div>
                  </div>
                  <div>
                    {i.meetingLink && (
                      <button onClick={() => joinMeeting(i.meetingLink)} className="btn-primary flex items-center gap-2">
                        <FiVideo size={18} />
                        Join Video Interview
                      </button>
                    )}
                    {!i.meetingLink && i.type === 'in-person' && (
                      <p className="text-sm text-slate-600">Location: {i.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {past.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-4">Past</h2>
            <div className="space-y-4">
              {past.map((i) => (
                <div key={i._id} className="card opacity-75">
                  <h3 className="font-semibold">{i.company?.companyName} - {i.job?.title}</h3>
                  <p className="text-slate-500 text-sm">{format(new Date(i.scheduledAt), 'PP')} · Status: {i.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {interviews.length === 0 && (
          <div className="card text-center py-12 text-slate-500">No interviews scheduled yet.</div>
        )}
      </div>
    </div>
  );
}
