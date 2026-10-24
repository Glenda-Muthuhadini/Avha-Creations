import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorState, LoadingState } from '../common/States';
export default function ProtectedAdminRoute() {
  const { loading, session, isAdmin, error } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState>Checking administrator access…</LoadingState>;
  if (error) return <ErrorState error={{ message: error }} />;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
