import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, Bell, Menu, X, User, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'organizer') return '/dashboard/organizer';
    return '/dashboard/attendee';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-pink-600 font-bold text-xl">
            <Calendar size={24} />
            EventHub
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-gray-600 hover:text-pink-600 transition-colors">
              Browse Events
            </Link>
            {user && (
              <>
                <Link to={dashboardLink()} className="text-gray-600 hover:text-pink-600 transition-colors">
                  Dashboard
                </Link>
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Link
                    to="/events/create"
                    className="flex items-center gap-1 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                  >
                    <Plus size={16} />
                    Create Event
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-gray-600 hover:text-pink-600 transition-colors relative"
                  >
                    <Bell size={20} />
                  </button>
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-pink-600">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-pink-600" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            )}
            {!user && (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-pink-600 text-sm font-medium">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          <Link to="/events" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Browse Events</Link>
          {user ? (
            <>
              <Link to={dashboardLink()} className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link to="/events/create" className="block py-2 text-pink-600 font-medium" onClick={() => setMenuOpen(false)}>Create Event</Link>
              )}
              <Link to="/profile" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block py-2 text-red-500 text-left w-full">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="block py-2 text-pink-600 font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
