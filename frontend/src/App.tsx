import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { apolloClient } from './lib/apollo-client';
import ProtectedRoute from './components/ProtectedRoute';
import PageTitle from './components/PageTitle';
import AdminLayout from './layouts/admin';
import AuthLayout from './layouts/auth';
import TrackShipment from './pages/TrackShipment';
import NotFound from './pages/NotFound';

// Redirect component for shipment details
function ShipmentRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/admin/shipments/${id}`} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <PageTitle />
              <Routes>
                {/* Auth routes */}
                <Route path="/auth/*" element={<AuthLayout />} />

                {/* Public tracking route */}
                <Route path="/track" element={<TrackShipment />} />

                {/* Protected admin routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/admin/default" replace />} />
                <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
                <Route path="/register" element={<Navigate to="/auth/sign-up" replace />} />
                <Route path="/dashboard" element={<Navigate to="/admin/default" replace />} />
                <Route path="/shipments/:id" element={<ShipmentRedirect />} />
                <Route path="/shipments" element={<Navigate to="/admin/shipments" replace />} />
                <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                <Route path="/drivers" element={<Navigate to="/admin/drivers" replace />} />
                <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />
                <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
                <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
