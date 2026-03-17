import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Users } from 'lucide-react';
import { Event, Category } from '../types';
import { eventsApi } from '../api/events.api';
import EventCard from '../components/events/EventCard';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventsApi.getAll({ limit: 8 }),
      eventsApi.getCategories(),
    ]).then(([eventsData, cats]) => {
      setEvents(eventsData.data);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/events?search=${encodeURIComponent(search)}`;
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-lg md:text-xl text-pink-100 mb-8">
            Find concerts, workshops, sports, and more near you
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-pink-600 px-6 py-3.5 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-pink-600">{events.length}+</div>
            <div className="text-sm text-gray-500 mt-1">Upcoming Events</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-600">{categories.length}</div>
            <div className="text-sm text-gray-500 mt-1">Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-600">Free</div>
            <div className="text-sm text-gray-500 mt-1">To Join</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/events?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-pink-300 hover:shadow-sm transition-all text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <Link to="/events" className="text-pink-600 text-sm font-medium hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No events yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-pink-50 border-t border-pink-100 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Host Your Own Event</h2>
        <p className="text-gray-500 mb-6">Create and manage events, sell tickets, track attendees.</p>
        <Link
          to="/register"
          className="inline-block bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
        >
          Get Started for Free
        </Link>
      </section>
    </div>
  );
}
