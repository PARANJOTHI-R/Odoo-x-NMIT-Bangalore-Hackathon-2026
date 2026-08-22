import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — guards pages behind authentication.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {'admin'|'employee'|null} [props.role] — if set, also enforces role
 */
export default function ProtectedRoute({ children, role = null }) {
  const { isAuthenticated, initialising, user } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100svh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to the appropriate dashboard for the authenticated user
    const destination = user?.role === 'hr' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
}
