import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Users, Calendar, Ticket, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Event, User, AdminStats } from '../types';
import { adminApi } from '../api/admin.api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<'pending' | 'all' | 'users'>('pending');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getPendingEvents()])
      .then(([s, p]) => { setStats(s); setPending(p); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'all' && allEvents.length === 0) {
      adminApi.getAllEvents().then(setAllEvents);
    }
    if (tab === 'users' && users.length === 0) {
      adminApi.getAllUsers().then(setUsers);
    }
  }, [tab]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveEvent(id);
      setPending((p) => p.filter((e) => e.id !== id));
      setStats((s) => s ? { ...s, pendingEvents: s.pendingEvents - 1 } : s);
      toast.success('Event approved!');
    } catch {
      toast.error('Failed');
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectReason[id] || 'Does not meet guidelines';
    try {
      await adminApi.rejectEvent(id, reason);
      setPending((p) => p.filter((e) => e.id !== id));
      setStats((s) => s ? { ...s, pendingEvents: s.pendingEvents - 1 } : s);
      toast.success('Event rejected');
    } catch {
      toast.error('Failed');
    }
  };

  const handleSeedCategories = async () => {
    try {
      await adminApi.seedCategories();
      toast.success('Categories seeded!');
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage events and users</p>
        </div>
        <button onClick={handleSeedCategories}
          className="text-sm border border-pink-200 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors">
          Seed Categories
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
            { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'pink' },
            { label: 'Tickets Sold', value: stats.totalTickets, icon: Ticket, color: 'purple' },
            { label: 'Pending Review', value: stats.pendingEvents, icon: Clock, color: 'yellow' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{s.label}</span>
                <s.icon size={18} className={`text-${s.color}-500`} />
              </div>
              <div className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['pending', 'all', 'users'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'pending' ? `Pending (${pending.length})` : t === 'all' ? 'All Events' : 'Users'}
          </button>
        ))}
      </div>

      {/* Pending events */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle size={48} className="mx-auto text-green-300 mb-4" />
              <p className="text-gray-500">No pending events to review</p>
            </div>
          ) : (
            pending.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-yellow-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={16} className="text-yellow-500" />
                      <Link to={`/events/${event.id}`} className="font-semibold text-gray-900 hover:text-pink-600">
                        {event.title}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      by <strong>{event.organizer?.name}</strong> · {format(new Date(event.startDate), 'MMM d, yyyy')} · {event.location}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</div>
                    <div className="flex gap-2 flex-wrap mt-1 text-xs text-gray-400">
                      <span>{event.isFree ? 'Free' : `$${event.ticketPrice}`}</span>
                      <span>·</span>
                      <span>Capacity: {event.capacity}</span>
                      {event.category && <><span>·</span><span>{event.category.icon} {event.category.name}</span></>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <button onClick={() => handleApprove(event.id)}
                      className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <div className="flex gap-1">
                      <input
                        placeholder="Rejection reason..."
                        value={rejectReason[event.id] || ''}
                        onChange={(e) => setRejectReason((r) => ({ ...r, [event.id]: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                      <button onClick={() => handleReject(event.id)}
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors flex-shrink-0">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All events */}
      {tab === 'all' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Organizer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allEvents.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/events/${e.id}`} className="font-medium text-gray-900 hover:text-pink-600">{e.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.organizer?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(e.startDate), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      e.status === 'approved' ? 'bg-green-100 text-green-700' :
                      e.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      e.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'organizer' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
