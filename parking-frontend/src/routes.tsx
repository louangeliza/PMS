import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // Updated import
import LoadingSpinner from './components/ui/LoadingSpinner';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import AddCarEntryPage from './pages/AddCarEntryPage';

// Lazy-loaded components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
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
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Root path renders LoginPage */}
        <Route path="/" element={<LoginPage />} /> {/* Changed to always show LoginPage */}

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
              <AddCarEntryPage />
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
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entries/new"
          element={
            <ProtectedRoute>
              <AddCarEntryPage />
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

        {/* Catch-all route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </Suspense>
  );
}