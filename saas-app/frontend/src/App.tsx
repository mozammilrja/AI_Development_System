import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './stores';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  TeamsPage,
  BillingPage,
  SettingsPage,
} from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated from storage
    const checkAuth = () => {
      setTimeout(() => {
        setLoading(false);
      }, 100);
    };
    checkAuth();
  }, [setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Protected routes */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/:tab" element={<SettingsPage />} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
