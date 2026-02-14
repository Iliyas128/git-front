import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useStore } from './store/useStore';
import AuthPage from './pages/AuthPage';
import PlayerDashboard from './pages/PlayerDashboard';
import SpinPage from './pages/SpinPage';
import ClubRoulettePage from './pages/ClubRoulettePage';
import ClubLayout from './pages/club/ClubLayout';
import ClubOverview from './pages/club/ClubOverview';
import ClubPlayers from './pages/club/ClubPlayers';
import ClubPrizes from './pages/club/ClubPrizes';
import ClubQR from './pages/club/ClubQR';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminClubs from './pages/admin/AdminClubs';
import AdminClubDetail from './pages/admin/AdminClubDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPrizes from './pages/admin/AdminPrizes';
import AdminRoulette from './pages/admin/AdminRoulette';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ProtectedRoute from './components/ProtectedRoute';

function RedirectAfterLogin() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { currentUser } = useStore();
  if (redirectTo && currentUser?.role === 'player') {
    const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
    return <Navigate to={path} replace />;
  }
  return <Navigate to="/" replace />;
}

function App() {
  const { isAuthenticated, currentUser } = useStore();

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <RedirectAfterLogin /> : <AuthPage />}
      />
      <Route
        path="/spin"
        element={
          <ProtectedRoute requiredRole="player">
            <SpinPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/player"
        element={
          <ProtectedRoute requiredRole="player">
            <PlayerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club"
        element={
          <ProtectedRoute requiredRole="club">
            <ClubLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClubOverview />} />
        <Route path="players" element={<ClubPlayers />} />
        <Route path="prizes" element={<ClubPrizes />} />
        <Route path="qr" element={<ClubQR />} />
      </Route>
      <Route
        path="/club/roulette"
        element={
          <ProtectedRoute requiredRole="club">
            <ClubRoulettePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="clubs" element={<AdminClubs />} />
        <Route path="clubs/:id" element={<AdminClubDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="prizes" element={<AdminPrizes />} />
        <Route path="roulette" element={<AdminRoulette />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            currentUser?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : currentUser?.role === 'club' ? (
              <Navigate to="/club" replace />
            ) : (
              <Navigate to="/player" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
