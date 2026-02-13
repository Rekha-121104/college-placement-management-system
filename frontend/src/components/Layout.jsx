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
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="font-display font-bold text-xl text-primary-400">PlacementHub</h1>
          <p className="text-slate-400 text-sm mt-0.5 capitalize">{user.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
