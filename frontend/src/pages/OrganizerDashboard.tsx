import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '../types';
import { eventsApi } from '../api/events.api';
import { useAuth } from '../contexts/AuthContext';

const statusConfig = {
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  pending: { label: 'Pending Review', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600 bg-red-50' },
  draft: { label: 'Draft', icon: AlertCircle, color: 'text-gray-600 bg-gray-100' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-gray-600 bg-gray-100' },
};

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);

  useEffect(() => {
    eventsApi.getMyEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  const loadAttendees = async (eventId: string) => {
    if (selectedEvent === eventId) { setSelectedEvent(null); return; }
    try {
      const data = await eventsApi.getAttendees(eventId);
      setAttendees(data);
      setSelectedEvent(eventId);
    } catch {
      setAttendees([]);
      setSelectedEvent(eventId);
    }
  };

  const stats = {
    total: events.length,
    approved: events.filter((e) => e.status === 'approved').length,
    pending: events.filter((e) => e.status === 'pending').length,
    rejected: events.filter((e) => e.status === 'rejected').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your events</p>
        </div>
        <Link to="/events/create" className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-pink-700 transition-colors">
          <Plus size={18} /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: stats.total, color: 'pink' },
          { label: 'Approved', value: stats.approved, color: 'green' },
          { label: 'Pending', value: stats.pending, color: 'yellow' },
          { label: 'Rejected', value: stats.rejected, color: 'red' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No events yet</p>
          <Link to="/events/create" className="bg-pink-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors">Create your first event</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const s = statusConfig[event.status] || statusConfig.draft;
            const StatusIcon = s.icon;
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar size={22} className="text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <Link to={`/events/${event.id}`} className="font-semibold text-gray-900 hover:text-pink-600 truncate">
                        {event.title}
                      </Link>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
                        <StatusIcon size={11} /> {s.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {format(new Date(event.startDate), 'EEE, MMM d, yyyy · h:mm a')} · {event.location}
                    </div>
                    {event.rejectionReason && (
                      <div className="text-xs text-red-500 mt-1">Reason: {event.rejectionReason}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => loadAttendees(event.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Users size={14} /> Attendees
                    </button>
                    <Link to={`/events/${event.id}/edit`}
                      className="flex items-center gap-1.5 text-sm text-pink-600 border border-pink-200 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition-colors">
                      <Edit size={14} /> Edit
                    </Link>
                  </div>
                </div>

                {/* Attendees table */}
                {selectedEvent === event.id && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Registered Attendees ({attendees.filter(a => a.status === 'registered').length})</h3>
                    {attendees.length === 0 ? (
                      <p className="text-sm text-gray-400">No registrations yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-200">
                              <th className="text-left pb-2">Name</th>
                              <th className="text-left pb-2">Email</th>
                              <th className="text-left pb-2">Ticket Code</th>
                              <th className="text-left pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {attendees.map((a) => (
                              <tr key={a.id}>
                                <td className="py-2 font-medium">{a.user?.name}</td>
                                <td className="py-2 text-gray-500">{a.user?.email}</td>
                                <td className="py-2 font-mono text-xs text-pink-600">{a.ticketCode}</td>
                                <td className="py-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {a.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
