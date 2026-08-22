import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Auth Pages
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';

// Employee Pages
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import AttendancePage from './pages/attendance/AttendancePage';
import LeavePage from './pages/leave/LeavePage';
import PayrollPage from './pages/payroll/PayrollPage';
import ProfilePage from './pages/profile/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminLeavePage from './pages/admin/AdminLeavePage';
import AdminPayrollPage from './pages/admin/AdminPayrollPage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import { useAuth } from './hooks/useAuth';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <Outlet />
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

function NotFound() {
  return (
    <div className="page-content flex-center" style={{ minHeight: '60vh', flexDirection: 'column', textAlign: 'center' }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--brand-500)' }}>404</div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary">Back to Dashboard</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<RootRedirect />} />
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute role="admin">
                <AdminEmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute role="admin">
                <AdminAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave"
            element={
              <ProtectedRoute role="admin">
                <AdminLeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payroll"
            element={
              <ProtectedRoute role="admin">
                <AdminPayrollPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
