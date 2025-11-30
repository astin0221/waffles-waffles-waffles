import React from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../types';

interface EventListItemProps {
  event: Event;
}

const EventListItem: React.FC<EventListItemProps> = ({ event }) => {
  const eventDate = new Date(event.eventDatetime);
  const formattedDate = eventDate.toLocaleDateString();
  const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="bg-white shadow rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{event.league?.name}</p>
            <div className="mt-2 flex items-center">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-lg font-semibold text-gray-900">{event.homeTeam?.name}</span>
                <span className="hidden sm:inline mx-2 text-gray-400">vs</span>
                <span className="text-lg font-semibold text-gray-900">{event.awayTeam?.name}</span>
              </div>
            </div>
          </div>
          <div className="ml-4 text-right">
            <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
            <p className="text-sm text-gray-500">{formattedTime}</p>
            <p className={`text-xs font-semibold mt-1 ${
              event.status === 'Scheduled' ? 'text-blue-600' : 
              event.status === 'Final' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {event.status}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventListItem;