import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        color: 'var(--accent-neon)',
        textAlign: 'center',
        padding: '100px 0',
        fontFamily: 'var(--font-display)',
        letterSpacing: '2px'
      }}>
        LOADING SECURE ACCESS POINT...
      </div>
    );
  }

  return user ? children : <Navigate to="/profile?redirect=checkout" replace />;
};

export default ProtectedRoute;
