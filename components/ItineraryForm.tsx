import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ItineraryRequest, PlaceSuggestion } from '../types';
import { getPlaceSuggestions } from '../services/geminiService';
import { SparklesIcon } from './Icons';

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

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !duration || !interests) {
        setError('Please fill out all required fields.');
        return;
    }
    setError(null);
    setShowSuggestions(false);
    onGenerate({ destination, duration, interests, budget });
  };

  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (...args: Parameters<F>): void => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func(...args), delay);
      };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
      debounce(async (query: string) => {
          if (query.length < 3) {
              setSuggestions([]);
              setShowSuggestions(false);
              return;
          }
          setIsSuggestionsLoading(true);
          const result = await getPlaceSuggestions(query);
          setSuggestions(result);
          setIsSuggestionsLoading(false);
          setShowSuggestions(true);
      }, 500),
      []
  );

  useEffect(() => {
      fetchSuggestions(destination);
  }, [destination, fetchSuggestions]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (formRef.current && !formRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  const handleSuggestionClick = (suggestionName: string) => {
      setDestination(suggestionName);
      setShowSuggestions(false);
      setSuggestions([]);
  };

  return (
    <div ref={formRef} className="w-full max-w-4xl bg-white/80 p-8 rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-200/80 backdrop-blur-md relative">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Plan Your Perfect Getaway</h2>
        <p className="text-gray-500 mt-2">Let our AI craft a personalized itinerary just for you.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, France"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            autoComplete="off"
          />
          {showSuggestions && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {isSuggestionsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
              ) : suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.name)}
                      className="flex items-center p-3 hover:bg-blue-50 cursor-pointer transition"
                    >
                      <img src={suggestion.imageUrl} alt={suggestion.name} className="w-16 h-12 object-cover rounded-md mr-4 flex-shrink-0" />
                      <span className="font-medium text-gray-700">{suggestion.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">No suggestions found.</div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Trip Duration</label>
            <input
              id="duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 7 days"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              {(['Budget-Friendly', 'Mid-Range', 'Luxury'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`flex-1 text-center px-3 py-1.5 rounded-md text-sm font-medium transition ${budget === b ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., History, Art, Food, Hiking"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
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
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generate My Itinerary
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryForm;