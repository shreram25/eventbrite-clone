import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Calendar size={20} className="text-pink-500" />
            EventHub
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/events" className="hover:text-white transition-colors">Browse Events</Link>
            <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
          </div>
          <p className="text-sm">© 2026 EventHub. CMPE202 Semester Project.</p>
        </div>
      </div>
    </footer>
  );
}
