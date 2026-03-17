import { useEffect, useState, useRef } from 'react';
import { Notification } from '../../types';
import { notificationsApi } from '../../api/notifications.api';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck } from 'lucide-react';

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationsApi.getAll().then(setNotifications).catch(() => {});
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <span className="font-semibold text-gray-800">Notifications {unread > 0 && <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{unread}</span>}</span>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs text-pink-600 flex items-center gap-1 hover:underline">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${!n.isRead ? 'bg-pink-50' : ''}`}>
              <p className="text-sm text-gray-700">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
