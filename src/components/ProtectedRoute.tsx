import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompany?: boolean; // New prop to control company requirement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireCompany = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign in page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  // Check if company information is required and missing
  if (requireCompany && user && !user.companyDetails) {
    // Redirect to profile page for business completion
    return <Navigate to="/profile" state={{ requireCompany: true, from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
