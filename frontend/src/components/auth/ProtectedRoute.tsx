import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthContainer from './AuthContainer';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useAuth();

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body items-center text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <h3 className="text-lg font-semibold text-base-content mt-4">
              Verificando autenticação...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth container
  if (!state.isAuthenticated) {
    return <AuthContainer />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 