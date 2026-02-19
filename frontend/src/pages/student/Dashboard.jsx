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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your placement overview.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/student/applications" className="stat-card group animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <FiFileText className="text-white" size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Applications</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.applications}</p>
              </div>
            </div>
          </div>
        </Link>
        <Link to="/student/interviews" className="stat-card group animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                <FiCalendar className="text-white" size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Interviews</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.interviews}</p>
              </div>
            </div>
          </div>
        </Link>
        <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <FiTrendingUp className="text-white" size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Offers</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.offers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Upcoming Interviews</h2>
            <Link to="/student/interviews" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-500 mb-2">No upcoming interviews</p>
              <Link to="/student/jobs" className="text-primary-600 hover:text-primary-700 font-semibold">Browse jobs →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((i, idx) => (
                <div key={i._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${0.5 + idx * 0.1}s` }}>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{i.company?.companyName}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{i.job?.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{format(new Date(i.scheduledAt), 'PPp')}</span>
                      <span>•</span>
                      <span className="badge badge-info capitalize">{i.type}</span>
                    </div>
                  </div>
                  <Link to={`/student/interviews`} className="btn-primary text-sm shrink-0 ml-4">View</Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/student/jobs" className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 hover:from-primary-100 hover:to-blue-100 transition-all group border border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiBriefcase className="text-white" size={20} />
              </div>
              <span className="font-semibold">Browse Jobs</span>
            </Link>
            <Link to="/student/profile" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiFileText className="text-white" size={20} />
              </div>
              <span className="font-semibold text-slate-700">Update Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
