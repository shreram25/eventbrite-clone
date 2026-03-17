import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Ticket as TicketType } from '../types';
import { ticketsApi } from '../api/tickets.api';
import { useAuth } from '../contexts/AuthContext';

export default function AttendeeDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    ticketsApi.getMyTickets().then(setTickets).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (ticketId: string) => {
    if (!confirm('Cancel this ticket?')) return;
    try {
      await ticketsApi.cancel(ticketId);
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: 'cancelled' } : t));
      toast.success('Ticket cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const now = new Date();
  const filtered = tickets.filter((t) => {
    const eventDate = new Date(t.event?.startDate);
    if (tab === 'upcoming') return t.status === 'registered' && eventDate >= now;
    if (tab === 'past') return t.status === 'registered' && eventDate < now;
    return t.status === 'cancelled';
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Upcoming', value: tickets.filter((t) => t.status === 'registered' && new Date(t.event?.startDate) >= now).length, color: 'pink' },
          { label: 'Past Events', value: tickets.filter((t) => t.status === 'registered' && new Date(t.event?.startDate) < now).length, color: 'purple' },
          { label: 'Cancelled', value: tickets.filter((t) => t.status === 'cancelled').length, color: 'gray' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['upcoming', 'past', 'cancelled'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No {tab} tickets</p>
          {tab === 'upcoming' && (
            <Link to="/events" className="mt-4 inline-block bg-pink-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors">
              Browse Events
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <div key={ticket.id} className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${ticket.status === 'cancelled' ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>
              <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={24} className="text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/events/${ticket.eventId}`} className="font-semibold text-gray-900 hover:text-pink-600 truncate block">
                  {ticket.event?.title}
                </Link>
                <div className="text-sm text-gray-500 mt-0.5">
                  {ticket.event?.startDate && format(new Date(ticket.event.startDate), 'EEE, MMM d · h:mm a')}
                </div>
                <div className="text-sm text-gray-400">{ticket.event?.location}</div>
                <div className="mt-1 font-mono text-xs text-pink-600 bg-pink-50 px-2 py-0.5 rounded inline-block">
                  {ticket.ticketCode}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  ticket.status === 'registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {ticket.status}
                </span>
                {ticket.status === 'registered' && new Date(ticket.event?.startDate) >= now && (
                  <button onClick={() => handleCancel(ticket.id)}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <X size={12} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
