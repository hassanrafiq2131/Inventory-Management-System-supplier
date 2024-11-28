import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  if (auth?.loading) {
    return <div>Loading...</div>;
  }

  return auth?.currentUser ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

export default PrivateRoute;