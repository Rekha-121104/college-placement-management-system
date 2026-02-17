import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentApplications from './pages/student/Applications';
import StudentInterviews from './pages/student/Interviews';
import JobsBrowse from './pages/student/JobsBrowse';
import CompanyDashboard from './pages/company/Dashboard';
import CompanyJobs from './pages/company/Jobs';
import CompanyApplications from './pages/company/Applications';
import CompanyInterviews from './pages/company/Interviews';
import CompanyProfile from './pages/company/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDrives from './pages/admin/PlacementDrives';
import AdminReports from './pages/admin/Reports';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
        <Route path="student/applications" element={<ProtectedRoute roles={['student']}><StudentApplications /></ProtectedRoute>} />
        <Route path="student/interviews" element={<ProtectedRoute roles={['student']}><StudentInterviews /></ProtectedRoute>} />
        <Route path="student/jobs" element={<ProtectedRoute roles={['student']}><JobsBrowse /></ProtectedRoute>} />
        <Route path="company" element={<ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="company/jobs" element={<ProtectedRoute roles={['company']}><CompanyJobs /></ProtectedRoute>} />
        <Route path="company/applications/:jobId?" element={<ProtectedRoute roles={['company']}><CompanyApplications /></ProtectedRoute>} />
        <Route path="company/interviews" element={<ProtectedRoute roles={['company']}><CompanyInterviews /></ProtectedRoute>} />
        <Route path="company/profile" element={<ProtectedRoute roles={['company']}><CompanyProfile /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/drives" element={<ProtectedRoute roles={['admin']}><AdminDrives /></ProtectedRoute>} />
        <Route path="admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
