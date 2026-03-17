import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { eventsApi } from '../api/events.api';
import { Category } from '../types';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    latitude: '',
    longitude: '',
    capacity: '100',
    categoryId: '',
    coverImage: '',
    isFree: true,
    ticketPrice: '0',
  });

  useEffect(() => {
    eventsApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const event = await eventsApi.create({
        ...form,
        capacity: Number(form.capacity),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        ticketPrice: Number(form.ticketPrice),
      });
      toast.success('Event submitted for review!');
      navigate(`/events/${event.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
      <p className="text-gray-500 mb-8">Your event will be reviewed before going live.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Give your event a great title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea required rows={5} value={form.description} onChange={(e) => set('description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              placeholder="Describe your event..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="https://..." />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Date & Time</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
              <input required type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End *</label>
              <input required type="datetime-local" value={form.endDate} onChange={(e) => set('endDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Location</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue / Address *</label>
            <input required value={form.location} onChange={(e) => set('location', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="123 Main St, San Jose, CA" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (for map)</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="37.3382" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (for map)</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="-121.8863" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Capacity & Pricing</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
            <input required type="number" min="1" value={form.capacity} onChange={(e) => set('capacity', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.isFree} onChange={() => { set('isFree', true); set('ticketPrice', '0'); }} />
                <span className="text-sm">Free</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!form.isFree} onChange={() => set('isFree', false)} />
                <span className="text-sm">Paid</span>
              </label>
            </div>
            {!form.isFree && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price ($)</label>
                <input required type="number" min="0" step="0.01" value={form.ticketPrice} onChange={(e) => set('ticketPrice', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-pink-600 text-white py-3.5 rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}
