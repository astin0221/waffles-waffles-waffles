import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import EventList from '../components/EventList';
import type { Event, Sport, League } from '../types';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch initial data (sports and leagues)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [sportsRes, leaguesRes] = await Promise.all([
          api.get('/sports'),
          api.get('/sports/leagues'),
        ]);
        setSports(sportsRes.data.sports);
        setLeagues(leaguesRes.data.leagues);
      } catch (error) {
        console.error('Failed to fetch initial data', error);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch events based on filters
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (selectedSport) params.sportId = selectedSport;
        if (selectedLeague) params.leagueId = selectedLeague;
        if (searchTerm) params.search = searchTerm;

        const response = await api.get('/events', { params });
        setEvents(response.data.events);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedSport, selectedLeague, searchTerm]);

  const handleSportChange = (sportId: number | null) => {
    setSelectedSport(sportId);
    setSelectedLeague(null); // Reset league when sport changes
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
        <SearchBar onSearch={setSearchTerm} />
        <FilterBar
          sports={sports}
          leagues={leagues}
          selectedSport={selectedSport}
          selectedLeague={selectedLeague}
          onSportChange={handleSportChange}
          onLeagueChange={setSelectedLeague}
        />
      </div>

      <EventList events={events} loading={loading} />
    </div>
  );
};

export default HomePage;