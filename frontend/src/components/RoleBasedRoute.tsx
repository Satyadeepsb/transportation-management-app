import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * A wrapper component that checks if the current user has permission to access a route
 * based on their role. If not, redirects to the dashboard.
 */
export default function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  const { user } = useAuth();

  // If no role restrictions, allow access to all authenticated users
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user's role is in allowed roles
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // User doesn't have permission, redirect to dashboard
  return <Navigate to="/admin/default" replace />;
}
