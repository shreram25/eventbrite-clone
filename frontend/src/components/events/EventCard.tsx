import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '../../types';

export default function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.spotsLeft ?? event.capacity;
  const isFull = spotsLeft === 0;

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        {/* Cover image */}
        <div className="h-40 bg-gradient-to-br from-pink-400 to-purple-500 relative overflow-hidden">
          {event.coverImage ? (
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Calendar size={40} className="text-white opacity-50" />
            </div>
          )}
          {event.isFree ? (
            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">FREE</span>
          ) : (
            <span className="absolute top-3 left-3 bg-white text-pink-600 text-xs font-bold px-2 py-1 rounded-full">${event.ticketPrice}</span>
          )}
          {isFull && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">FULL</span>
          )}
        </div>

        <div className="p-4">
          {event.category && (
            <span className="text-xs text-pink-600 font-medium uppercase tracking-wide">
              {event.category.icon} {event.category.name}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {event.title}
          </h3>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={12} />
              {format(new Date(event.startDate), 'EEE, MMM d · h:mm a')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users size={12} />
              {spotsLeft} / {event.capacity} spots left
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">by {event.organizer?.name}</span>
            <span className="text-xs font-medium text-pink-600 group-hover:underline">View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
