import React from 'react';
import type { Sport, League } from '../types';

interface FilterBarProps {
  sports: Sport[];
  leagues: League[];
  selectedSport: number | null;
  selectedLeague: number | null;
  onSportChange: (sportId: number | null) => void;
  onLeagueChange: (leagueId: number | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sports,
  leagues,
  selectedSport,
  selectedLeague,
  onSportChange,
  onLeagueChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
      <div className="flex-1">
        <label htmlFor="sport-select" className="block text-sm font-medium text-gray-700 mb-1">
          Sport
        </label>
        <select
          id="sport-select"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          value={selectedSport || ''}
          onChange={(e) => onSportChange(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Sports</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="league-select" className="block text-sm font-medium text-gray-700 mb-1">
          League
        </label>
        <select
          id="league-select"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          value={selectedLeague || ''}
          onChange={(e) => onLeagueChange(e.target.value ? Number(e.target.value) : null)}
          disabled={!selectedSport}
        >
          <option value="">All Leagues</option>
          {leagues
            .filter((league) => !selectedSport || league.sportId === selectedSport)
            .map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;