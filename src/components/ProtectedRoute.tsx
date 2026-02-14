import { Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useStore();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
