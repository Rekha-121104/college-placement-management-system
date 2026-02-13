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
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Company Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/company/jobs" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            <FiBriefcase className="text-primary-600" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Active Jobs</p>
            <p className="text-2xl font-bold">{stats.jobs}</p>
          </div>
        </Link>
        <Link to="/company/applications" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-teal/20 flex items-center justify-center">
            <FiUsers className="text-accent-teal" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Applications</p>
            <p className="text-2xl font-bold">{stats.applications}</p>
          </div>
        </Link>
        <Link to="/company/interviews" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-amber/20 flex items-center justify-center">
            <FiCalendar className="text-accent-amber" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Interviews</p>
            <p className="text-2xl font-bold">{stats.interviews}</p>
          </div>
        </Link>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/company/jobs" className="btn-primary">Post New Job</Link>
          <Link to="/company/applications" className="btn-secondary">Review Applications</Link>
          <Link to="/company/interviews" className="btn-secondary">Schedule Interviews</Link>
        </div>
      </div>
    </div>
  );
}
