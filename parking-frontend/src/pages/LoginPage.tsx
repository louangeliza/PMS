import React from 'react';
import { AuthLayout } from '../components/layout/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;

  return (
    <AuthLayout title="Sign In">
      <LoginForm />
    </AuthLayout>
  );
}