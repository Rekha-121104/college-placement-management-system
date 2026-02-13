import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiUsers, FiBriefcase, FiFileText, FiTrendingUp, FiCalendar } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setStats(data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="card">
          <FiUsers className="text-primary-500 mb-2" size={24} />
          <p className="text-slate-500 text-sm">Students</p>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
        </div>
        <div className="card">
          <FiBriefcase className="text-accent-teal mb-2" size={24} />
          <p className="text-slate-500 text-sm">Companies</p>
          <p className="text-2xl font-bold">{stats.totalCompanies}</p>
        </div>
        <div className="card">
          <FiFileText className="text-accent-amber mb-2" size={24} />
          <p className="text-slate-500 text-sm">Applications</p>
          <p className="text-2xl font-bold">{stats.totalApplications}</p>
        </div>
        <div className="card">
          <FiTrendingUp className="text-green-500 mb-2" size={24} />
          <p className="text-slate-500 text-sm">Placed</p>
          <p className="text-2xl font-bold">{stats.placedStudents}</p>
        </div>
        <div className="card">
          <FiCalendar className="text-purple-500 mb-2" size={24} />
          <p className="text-slate-500 text-sm">Interviews</p>
          <p className="text-2xl font-bold">{stats.totalInterviews}</p>
        </div>
        <div className="card">
          <p className="text-slate-500 text-sm">Placement Rate</p>
          <p className="text-2xl font-bold">{stats.placementRate}%</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Applications</h2>
          <div className="space-y-3">
            {(stats.recentApplications || []).slice(0, 5).map((a) => (
              <div key={a._id} className="flex justify-between text-sm">
                <span>{a.student?.fullName} → {a.job?.company?.companyName}</span>
                <span className="text-slate-500">{a.status}</span>
              </div>
            ))}
            {(!stats.recentApplications || stats.recentApplications.length === 0) && <p className="text-slate-500">No recent applications</p>}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/drives" className="btn-primary">Manage Placement Drives</Link>
            <Link to="/admin/reports" className="btn-secondary">View Reports</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
