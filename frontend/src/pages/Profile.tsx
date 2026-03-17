import { useState } from 'react';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', avatarUrl: user?.avatarUrl || '' });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = { admin: 'purple', organizer: 'pink', attendee: 'blue' };
  const color = roleColors[user?.role || 'attendee'];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-pink-500" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`mt-1 inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-${color}-100 text-${color}-700 capitalize`}>
              {user?.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-pink-600 text-white py-2.5 rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {user?.bio && (
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Bio</div>
                <p className="text-gray-700 text-sm">{user.bio}</p>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Member since</div>
              <p className="text-gray-700 text-sm">{new Date(user?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={() => setEditing(true)}
              className="w-full border border-pink-200 text-pink-600 py-2.5 rounded-xl font-medium hover:bg-pink-50 transition-colors">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
