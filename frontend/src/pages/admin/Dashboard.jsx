import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiUsers, FiBriefcase, FiFileText, FiTrendingUp, FiCalendar, FiBarChart2 } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setStats(data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 flex justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of placement activities</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-3 shadow-lg shadow-primary-500/30">
            <FiUsers className="text-white" size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Students</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalStudents}</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/30">
            <FiBriefcase className="text-white" size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Companies</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCompanies}</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
            <FiFileText className="text-white" size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Applications</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalApplications}</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3 shadow-lg shadow-green-500/30">
            <FiTrendingUp className="text-white" size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Placed</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.placedStudents}</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
            <FiCalendar className="text-white" size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Interviews</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalInterviews}</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
            <FiBarChart2 className="text-white" size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Placement Rate</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.placementRate}%</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Applications</h2>
          <div className="space-y-3">
            {(stats.recentApplications || []).slice(0, 5).map((a, idx) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all animate-slide-up" style={{ animationDelay: `${0.5 + idx * 0.05}s` }}>
                <div>
                  <p className="font-medium text-slate-800">{a.student?.fullName}</p>
                  <p className="text-sm text-slate-500">{a.job?.company?.companyName}</p>
                </div>
                <span className="badge badge-info capitalize text-xs">{a.status?.replace(/_/g, ' ')}</span>
              </div>
            ))}
            {(!stats.recentApplications || stats.recentApplications.length === 0) && (
              <p className="text-slate-500 text-center py-8">No recent applications</p>
            )}
          </div>
        </div>
        <div className="card animate-slide-up" style={{ animationDelay: '0.45s' }}>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/drives" className="btn-primary w-full flex items-center justify-center gap-2">
              <FiBriefcase size={18} />
              Manage Placement Drives
            </Link>
            <Link to="/admin/reports" className="btn-secondary w-full flex items-center justify-center gap-2">
              <FiBarChart2 size={18} />
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
