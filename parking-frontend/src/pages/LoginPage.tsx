// src/pages/LoginPage.tsx
import React from 'react';
import { AuthLayout } from '../components/layout/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="Sign In">
      <LoginForm />
    </AuthLayout>
  );
}