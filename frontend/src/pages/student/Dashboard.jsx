import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiBriefcase, FiCalendar, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0 });
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [apps, ints] = await Promise.all([
          api.get('/applications/my'),
          api.get('/interviews/student'),
        ]);
        const applications = apps.data;
        const interviews = ints.data;
        setStats({
          applications: applications.length,
          interviews: interviews.length,
          offers: applications.filter((a) => ['offer_extended', 'offer_accepted'].includes(a.status)).length,
        });
        setUpcoming(interviews.filter((i) => new Date(i.scheduledAt) > new Date()).slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/student/applications" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            <FiFileText className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Applications</p>
            <p className="text-2xl font-bold">{stats.applications}</p>
          </div>
        </Link>
        <Link to="/student/interviews" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-teal/20 flex items-center justify-center">
            <FiCalendar className="text-accent-teal" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Interviews</p>
            <p className="text-2xl font-bold">{stats.interviews}</p>
          </div>
        </Link>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-amber/20 flex items-center justify-center">
            <FiTrendingUp className="text-accent-amber" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Offers</p>
            <p className="text-2xl font-bold">{stats.offers}</p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h2 className="font-semibold mb-4">Upcoming Interviews</h2>
          {upcoming.length === 0 ? (
            <p className="text-slate-500">No upcoming interviews. <Link to="/student/jobs" className="text-primary-600 hover:underline">Browse jobs</Link></p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((i) => (
                <div key={i._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{i.company?.companyName} - {i.job?.title}</p>
                    <p className="text-sm text-slate-500">{format(new Date(i.scheduledAt), 'PPp')} • {i.type}</p>
                  </div>
                  <Link to={`/student/interviews`} className="btn-primary text-sm">View</Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/student/jobs" className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition">
              <FiBriefcase size={20} />
              Browse Jobs
            </Link>
            <Link to="/student/profile" className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition">
              Update Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
