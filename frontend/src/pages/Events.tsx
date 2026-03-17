import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Event, Category, PaginatedEvents } from '../types';
import { eventsApi, EventFilters } from '../api/events.api';
import EventCard from '../components/events/EventCard';
import EventFiltersComponent from '../components/events/EventFilters';

export default function Events() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedEvents | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<EventFilters>({
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    page: 1,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    eventsApi.getAll(filters)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilter = (newFilters: EventFilters) => {
    setFilters({ ...newFilters, page: 1, limit: 12 });
  };

  const events = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Events</h1>
        <p className="text-gray-500">Discover events happening near you</p>
      </div>

      <div className="mb-6">
        <EventFiltersComponent categories={categories} onFilter={handleFilter} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">{data?.total} events found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(data.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    filters.page === i + 1
                      ? 'bg-pink-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <CalendarDays size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No events found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
