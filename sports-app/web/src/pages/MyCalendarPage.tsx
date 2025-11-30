import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventList from '../components/EventList';
import type { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }

    const fetchCalendarEvents = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await api.get('/user/calendar');
          setEvents(response.data.events);
        } catch (error) {
          console.error('Failed to fetch calendar events', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCalendarEvents();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className="text-center py-12">Loading your calendar...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Calendar</h1>
      <EventList events={events} />
    </div>
  );
};

export default MyCalendarPage;