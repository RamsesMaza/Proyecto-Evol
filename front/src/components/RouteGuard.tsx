import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSkeleton } from './ui/Skeleton';
import type { ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
}

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const { loading, user } = useAuth();
  if (loading) return <PageSkeleton variant="panel" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const PublicGuard = ({ children }: RouteGuardProps) => {
  const { loading, user } = useAuth();
  if (loading) return <PageSkeleton variant="panel" />;
  if (user) return <Navigate to="/panel" replace />;
  return <>{children}</>;
};
