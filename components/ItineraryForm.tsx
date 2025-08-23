import React, { useState } from 'react';
import { ItineraryRequest } from '../types';
import { PlaneIcon, SparklesIcon } from './Icons';

interface ItineraryFormProps {
  onGenerate: (request: ItineraryRequest) => void;
  isLoading: boolean;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({ onGenerate, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState<'Budget-Friendly' | 'Mid-Range' | 'Luxury'>('Mid-Range');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !duration || !interests) {
        setError('Please fill out all required fields.');
        return;
    }
    setError(null);
    onGenerate({ destination, duration, interests, budget });
  };

  return (
    <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Plan Your Perfect Trip</h2>
        <p className="text-slate-600 mt-2">Describe your dream vacation and let our AI craft a personalized itinerary for you.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Kyoto, Japan"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">Trip Duration</label>
          <input
            type="text"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 7 days"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
          <select
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value as typeof budget)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white"
          >
            <option>Budget-Friendly</option>
            <option>Mid-Range</option>
            <option>Luxury</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="interests" className="block text-sm font-medium text-slate-700 mb-1">Interests & Preferences</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., historical sites, street food, hiking, art museums"
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        {error && <p className="md:col-span-2 text-red-500 text-sm text-center">{error}</p>}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </>
            ) : (
                <>
                    <SparklesIcon className="h-5 w-5 mr-2"/>
                    Generate Itinerary
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryForm;