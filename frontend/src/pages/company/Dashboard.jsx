import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiBriefcase, FiUsers, FiCalendar } from 'react-icons/fi';

export default function CompanyDashboard() {
  const [stats, setStats] = useState({ jobs: 0, applications: 0, interviews: 0 });

  useEffect(() => {
    (async () => {
      try {
        const jobsRes = await api.get('/companies/jobs');
        const jobs = jobsRes.data;
        let appCount = 0;
        for (const j of jobs) {
          try {
            const a = await api.get(`/applications/job/${j._id}`);
            appCount += a.data.length;
          } catch (_) {}
        }
        const intRes = await api.get('/interviews/company');
        setStats({
          jobs: jobs.length,
          applications: appCount,
          interviews: intRes.data.length,
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Company Dashboard</h1>
        <p className="text-slate-600">Manage your recruitment activities</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/company/jobs" className="stat-card group animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <FiBriefcase className="text-white" size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.jobs}</p>
              </div>
            </div>
          </div>
        </Link>
        <Link to="/company/applications" className="stat-card group animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                <FiUsers className="text-white" size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Applications</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.applications}</p>
              </div>
            </div>
          </div>
        </Link>
        <Link to="/company/interviews" className="stat-card group animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <FiCalendar className="text-white" size={26} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Interviews</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.interviews}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
      <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/company/jobs" className="btn-primary flex items-center gap-2">
            <FiBriefcase size={18} />
            Post New Job
          </Link>
          <Link to="/company/applications" className="btn-secondary flex items-center gap-2">
            <FiUsers size={18} />
            Review Applications
          </Link>
          <Link to="/company/interviews" className="btn-secondary flex items-center gap-2">
            <FiCalendar size={18} />
            Schedule Interviews
          </Link>
        </div>
      </div>
    </div>
  );
}
