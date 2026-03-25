import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, Download, Clock } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import toast from 'react-hot-toast';
import { Ticket } from '../types';
import { ticketsApi } from '../api/tickets.api';
import { eventsApi } from '../api/events.api';
import { useAuth } from '../contexts/AuthContext';

export default function CalendarPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    ticketsApi
      .getMyTickets()
      .then((all) => setTickets(all.filter((t) => t.status === 'registered')))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDownloadICS = async (eventId: string, eventTitle: string) => {
    try {
      const url = eventsApi.getICSUrl(eventId);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventTitle.replace(/\s+/g, '-')}.ics`;
      a.click();
      toast.success('Calendar file downloaded');
    } catch {
      toast.error('Failed to download calendar file');
    }
  };

  const eventsThisMonth = tickets.filter((t) =>
    t.event?.startDate && isSameMonth(new Date(t.event.startDate), currentMonth)
  );

  const prevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in to view your calendar</h2>
        <Link to="/login" className="text-indigo-600 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CalendarIcon className="h-6 w-6 text-indigo-600" />
        My Event Calendar
      </h1>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
        >
          &larr; Prev
        </button>
        <span className="text-lg font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={nextMonth}
          className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
        >
          Next &rarr;
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your events...</div>
      ) : eventsThisMonth.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CalendarIcon className="mx-auto h-10 w-10 mb-3" />
          <p>No registered events in {format(currentMonth, 'MMMM yyyy')}.</p>
          <Link to="/events" className="mt-2 inline-block text-indigo-600 hover:underline text-sm">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {eventsThisMonth
            .sort((a, b) =>
              new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime()
            )
            .map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4 shadow-sm"
              >
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 text-center bg-indigo-50 rounded-lg p-2">
                  <div className="text-xs font-medium text-indigo-500 uppercase">
                    {format(new Date(ticket.event.startDate), 'MMM')}
                  </div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {format(new Date(ticket.event.startDate), 'd')}
                  </div>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/events/${ticket.event.id}`}
                    className="text-base font-semibold text-gray-900 hover:text-indigo-600 truncate block"
                  >
                    {ticket.event.title}
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(ticket.event.startDate), 'h:mm a')}
                    {ticket.event.endDate && (
                      <> – {format(new Date(ticket.event.endDate), 'h:mm a')}</>
                    )}
                  </div>
                  {ticket.event.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {ticket.event.location}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Ticket #{ticket.ticketCode}
                  </div>
                </div>

                {/* Download ICS */}
                <button
                  onClick={() => handleDownloadICS(ticket.event.id, ticket.event.title)}
                  className="flex-shrink-0 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded px-3 py-1.5 hover:bg-indigo-50 transition"
                  title="Add to Calendar"
                >
                  <Download className="h-4 w-4" />
                  .ics
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Summary */}
      {!loading && tickets.length > 0 && (
        <p className="mt-6 text-sm text-gray-400 text-center">
          {tickets.length} registered event{tickets.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  );
}
