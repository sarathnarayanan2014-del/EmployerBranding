import { AuthProvider, useAuth } from './lib/AuthContext';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import CompanyDashboard from './components/CompanyDashboard';

function Routed() {
  const { session, profile, loading } = useAuth();

  if (loading) return <div className="center-loading">Loading Command Center…</div>;
  if (!session || !profile) return <LoginScreen />;
  if (profile.role === 'admin') return <AdminDashboard />;
  return <CompanyDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routed />
    </AuthProvider>
  );
}
