// src/routes.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/ui/LoadingSpinner';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Lazy-loaded components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AddVehiclePage = lazy(() => import('./pages/AddVehiclePage'));
const EditVehiclePage = lazy(() => import('./pages/EditVehiclePage'));
const NewRequestPage = lazy(() => import('./pages/NewRequestPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AddParkingPage = lazy(() => import('./pages/admin/AddParkingPage'));
const NewEntryPage = lazy(() => import('./pages/admin/NewEntryPage'));
const ActiveEntriesPage = lazy(() => import('./pages/admin/ActiveEntriesPage'));
const CompleteEntryPage = lazy(() => import('./pages/admin/CompleteEntryPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/parking/new"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AddParkingPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/entries/new"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <NewEntryPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/entries/active"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <ActiveEntriesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/entries/:id/complete"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <CompleteEntryPage />
            </RoleProtectedRoute>
          }
        />

        {/* Client Routes */}
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['client']}>
              <DashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/vehicles/add"
          element={
            <ProtectedRoute>
              <AddVehiclePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/:id/edit"
          element={
            <ProtectedRoute>
              <EditVehiclePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <NewRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
              replace 
            />
          } 
        />
        <Route 
          path="*" 
          element={
            <Navigate 
              to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
              replace 
            />
          } 
        />
      </Routes>
    </Suspense>
  );
}
