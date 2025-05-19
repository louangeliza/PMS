import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Properly typed lazy imports with default exports
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.default })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.default })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.default })));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage').then(module => ({ default: module.default })));
const AddVehiclePage = lazy(() => import('./pages/AddVehiclePage').then(module => ({ default: module.default })));
const EditVehiclePage = lazy(() => import('./pages/EditVehiclePage').then(module => ({ default: module.default })));
const RequestsPage = lazy(() => import('./pages/RequestsPage').then(module => ({ default: module.default })));
const NewRequestPage = lazy(() => import('./pages/NewRequestPage').then(module => ({ default: module.default })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.default })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.default })));

// Define proper types for children
interface RouteProps {
  children: React.ReactElement;
}

function PrivateRoute({ children }: RouteProps) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: RouteProps) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

// Define props for LoadingSpinner if needed
interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        
        <Route path="/vehicles" element={
          <PrivateRoute>
            <VehiclesPage />
          </PrivateRoute>
        } />
        
        <Route path="/vehicles/add" element={
          <PrivateRoute>
            <AddVehiclePage />
          </PrivateRoute>
        } />
        
        <Route path="/vehicles/edit/:id" element={
          <PrivateRoute>
            <EditVehiclePage />
          </PrivateRoute>
        } />
        
        <Route path="/requests" element={
          <PrivateRoute>
            <RequestsPage />
          </PrivateRoute>
        } />
        
        <Route path="/requests/new" element={
          <PrivateRoute>
            <NewRequestPage />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}