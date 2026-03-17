import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag, Download, Edit, CreditCard, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Event, Ticket } from '../types';
import { eventsApi } from '../api/events.api';
import { ticketsApi } from '../api/tickets.api';
import { useAuth } from '../contexts/AuthContext';
import EventMap from '../components/events/EventMap';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [myTicket, setMyTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [mockCard, setMockCard] = useState('4111 1111 1111 1111');

  useEffect(() => {
    if (!id) return;
    eventsApi.getOne(id).then(setEvent).catch(() => navigate('/events')).finally(() => setLoading(false));
    if (user) {
      ticketsApi.getMyTickets().then((tickets) => {
        const t = tickets.find((t) => t.eventId === id && t.status === 'registered');
        setMyTicket(t || null);
      }).catch(() => {});
    }
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    if (!event?.isFree) { setShowPayment(true); return; }
    await doRegister();
  };

  const doRegister = async (cardNumber?: string) => {
    if (!event) return;
    setRegistering(true);
    try {
      const ticket = await ticketsApi.register(event.id, cardNumber);
      setMyTicket(ticket);
      setShowPayment(false);
      toast.success('Successfully registered!');
      setEvent((e) => e ? { ...e, spotsLeft: (e.spotsLeft ?? e.capacity) - 1 } : e);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!myTicket) return;
    if (!confirm('Cancel your registration?')) return;
    try {
      await ticketsApi.cancel(myTicket.id);
      setMyTicket(null);
      toast.success('Registration cancelled');
      setEvent((e) => e ? { ...e, spotsLeft: (e.spotsLeft ?? 0) + 1 } : e);
    } catch {
      toast.error('Failed to cancel');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (!event) return null;

  const isOrganizer = user?.id === event.organizerId || user?.role === 'admin';
  const spotsLeft = event.spotsLeft ?? event.capacity;
  const isFull = spotsLeft === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl overflow-hidden mb-6 relative">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar size={64} className="text-white opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 flex gap-2">
          {event.isFree ? (
            <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">FREE</span>
          ) : (
            <span className="bg-white text-pink-600 text-sm font-bold px-3 py-1 rounded-full">${event.ticketPrice}</span>
          )}
          {event.category && (
            <span className="bg-black/40 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
              {event.category.icon} {event.category.name}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
              <Calendar className="text-pink-600 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium">DATE & TIME</div>
                <div className="text-sm font-semibold text-gray-800">
                  {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(event.startDate), 'h:mm a')} – {format(new Date(event.endDate), 'h:mm a')}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
              <MapPin className="text-pink-600 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium">LOCATION</div>
                <div className="text-sm font-semibold text-gray-800">{event.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
              <Users className="text-pink-600 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium">CAPACITY</div>
                <div className="text-sm font-semibold text-gray-800">{spotsLeft} / {event.capacity} spots left</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-pink-500 h-1.5 rounded-full"
                    style={{ width: `${Math.max(0, ((event.capacity - spotsLeft) / event.capacity) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
              <Tag className="text-pink-600 mt-0.5" size={18} />
              <div>
                <div className="text-xs text-gray-500 font-medium">ORGANIZER</div>
                <div className="text-sm font-semibold text-gray-800">{event.organizer?.name}</div>
                {event.organizer?.email && <div className="text-xs text-gray-500">{event.organizer.email}</div>}
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About this event</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          {/* Map */}
          {event.latitude && event.longitude && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
              <EventMap
                latitude={Number(event.latitude)}
                longitude={Number(event.longitude)}
                title={event.title}
                location={event.location}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Register card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sticky top-20">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {event.isFree ? 'Free' : `$${event.ticketPrice}`}
            </div>
            <p className="text-sm text-gray-500 mb-4">per ticket</p>

            {myTicket ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-green-700 font-semibold text-sm">You're registered!</div>
                  <div className="text-green-600 text-xs mt-1">Ticket: {myTicket.ticketCode}</div>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-full border border-red-200 text-red-500 py-2.5 rounded-lg text-sm hover:bg-red-50 transition-colors"
                >
                  Cancel Registration
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isFull || registering}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFull ? 'Event Full' : registering ? 'Registering...' : event.isFree ? 'Register for Free' : 'Get Tickets'}
              </button>
            )}

            {/* Calendar download */}
            <a
              href={eventsApi.getICSUrl(event.id)}
              download
              className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Download size={14} /> Add to Calendar (.ics)
            </a>

            {isOrganizer && (
              <Link
                to={`/events/${event.id}/edit`}
                className="mt-2 w-full flex items-center justify-center gap-2 border border-pink-200 text-pink-600 py-2.5 rounded-lg text-sm hover:bg-pink-50 transition-colors"
              >
                <Edit size={14} /> Edit Event
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mock payment modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Complete Payment</h3>
              <button onClick={() => setShowPayment(false)}><X size={20} /></button>
            </div>
            <div className="bg-pink-50 rounded-lg p-3 mb-4 text-sm text-pink-700">
              This is a mock payment for demo purposes.
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  value={mockCard}
                  onChange={(e) => setMockCard(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input defaultValue="12/28" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input defaultValue="123" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" readOnly />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Total</span>
              <span className="font-bold text-pink-600">${event.ticketPrice}</span>
            </div>
            <button
              onClick={() => doRegister(mockCard)}
              disabled={registering}
              className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              {registering ? 'Processing...' : 'Pay & Register'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
