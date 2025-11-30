import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import EventDetailCard from '../components/EventDetailCard';
import AddToCalendarButton from '../components/AddToCalendarButton';
import { useAuth } from '../contexts/AuthContext';
import type { Event } from '../types';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isInCalendar, setIsInCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [eventRes, calendarCheckRes] = await Promise.all([
          api.get(`/events/${id}`),
          user ? api.get(`/user/calendar/check/${id}`) : Promise.resolve(null),
        ]);
        setEvent(eventRes.data.event);
        if (calendarCheckRes) {
          setIsInCalendar(calendarCheckRes.data.inCalendar);
        }
      } catch (error) {
        console.error('Failed to fetch event details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleToggleCalendar = async (eventId: number) => {
    if (!user) {
      // or redirect to login
      alert('Please login to add events to your calendar');
      return;
    }
    setToggleLoading(true);
    try {
      if (isInCalendar) {
        await api.delete(`/user/calendar/${eventId}`);
        setIsInCalendar(false);
      } else {
        await api.post('/user/calendar', { eventId });
        setIsInCalendar(true);
      }
    } catch (error) {
      console.error('Failed to toggle calendar status', error);
    } finally {
      setToggleLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!event) {
    return <div className="text-center py-12">Event not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EventDetailCard event={event} />
      {user && (
        <div className="mt-6 text-center">
          <AddToCalendarButton
            eventId={event.id}
            isInCalendar={isInCalendar}
            onToggle={handleToggleCalendar}
            loading={toggleLoading}
          />
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;