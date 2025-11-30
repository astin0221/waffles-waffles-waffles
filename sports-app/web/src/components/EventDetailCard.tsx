import React from 'react';
import type { Event } from '../types';

interface EventDetailCardProps {
  event: Event;
}

const EventDetailCard: React.FC<EventDetailCardProps> = ({ event }) => {
  const eventDate = new Date(event.eventDatetime);
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Event Details
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {event.league?.name} • {event.league?.sport?.name}
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center justify-center space-x-8 w-full">
            <div className="text-center flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{event.homeTeam?.name}</h4>
              <p className="text-sm text-gray-500">Home</p>
            </div>
            <div className="text-3xl font-bold text-gray-400">VS</div>
            <div className="text-center flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{event.awayTeam?.name}</h4>
              <p className="text-sm text-gray-500">Away</p>
            </div>
          </div>

          <div className="w-full border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formattedDate}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formattedTime}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.status}</dd>
              </div>
              {(event.homeScore !== null && event.awayScore !== null) && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Score</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {event.homeTeam?.name}: {event.homeScore} - {event.awayTeam?.name}: {event.awayScore}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailCard;