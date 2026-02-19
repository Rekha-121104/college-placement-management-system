import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiBriefcase, FiSettings, FiBarChart2 } from 'react-icons/fi';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <Outlet />;

  const navItems = {
    student: [
      { to: '/student', label: 'Dashboard', icon: FiBarChart2 },
      { to: '/student/jobs', label: 'Browse Jobs', icon: FiBriefcase },
      { to: '/student/applications', label: 'My Applications', icon: FiUser },
      { to: '/student/interviews', label: 'Interviews', icon: FiSettings },
      { to: '/student/profile', label: 'Profile', icon: FiUser },
    ],
    company: [
      { to: '/company', label: 'Dashboard', icon: FiBarChart2 },
      { to: '/company/jobs', label: 'Jobs', icon: FiBriefcase },
      { to: '/company/applications', label: 'Applications', icon: FiUser },
      { to: '/company/interviews', label: 'Interviews', icon: FiSettings },
      { to: '/company/profile', label: 'Profile', icon: FiUser },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard', icon: FiBarChart2 },
      { to: '/admin/drives', label: 'Placement Drives', icon: FiBriefcase },
      { to: '/admin/reports', label: 'Reports', icon: FiBarChart2 },
    ],
  };

  const items = navItems[user.role] || [];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-700/50">
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary-600/10 to-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
              <FiBriefcase className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">PlacementHub</h1>
              <p className="text-slate-400 text-xs mt-0.5 capitalize font-medium">{user.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-500/30' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                }`
              }
            >
              <Icon size={20} className={({ isActive }) => isActive ? 'text-white' : 'group-hover:text-primary-400'} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 hover:translate-x-1 group"
          >
            <FiLogOut size={20} className="group-hover:text-red-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
