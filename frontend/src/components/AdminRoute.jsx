import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const AdminRoute = ({ children }) => {
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
        ESTABLISHING ADMIN ENCRYPTED CHANNEL...
      </div>
    );
  }

  return user && user.isAdmin ? children : <Navigate to="/profile" replace />;
};

export default AdminRoute;
