import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import AttendeeDashboard from './pages/AttendeeDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="events/create"
          element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="events/:id/edit"
          element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/attendee"
          element={
            <ProtectedRoute roles={['attendee']}>
              <AttendeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/organizer"
          element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
