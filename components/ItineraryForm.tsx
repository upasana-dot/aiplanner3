import React, { useState, useEffect, useCallback } from 'react';
import { ItineraryRequest, PlaceSuggestion } from '../types';
import { getPlaceSuggestions } from '../services/geminiService';
import { SparklesIcon, CompassIcon, MapPinIcon, CheckSquareIcon, SquareIcon } from './Icons';

// A more robust debounce implementation that correctly handles both sync and async functions.
const debounce = <F extends (...args: any[]) => any>(
    func: F,
    waitFor: number
) => {
    let timeout: ReturnType<typeof setTimeout>;

    // If the original function returns a Promise, get the type it resolves to.
    // Otherwise, use the return type as is. The debounced function will always wrap this in a Promise.
    type ResolvedReturnType = ReturnType<F> extends Promise<infer U> ? U : ReturnType<F>;

    return (...args: Parameters<F>): Promise<ResolvedReturnType> =>
        new Promise(resolve => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Promise.resolve handles both promise and non-promise values from func, preventing nested promises.
                Promise.resolve(func(...args)).then(resolve);
            }, waitFor);
        });
};


interface ItineraryFormProps {
    onGenerate: (request: ItineraryRequest) => void;
    isLoading: boolean;
    userEmail: string;
}

const interestsOptions = ['History', 'Art & Culture', 'Food & Drink', 'Adventure & Outdoors', 'Shopping', 'Relaxation', 'Nightlife', 'Kid-Friendly'];
const transportOptions = ['Public Transit', 'Rental Car', 'Ride-Sharing/Taxis', 'Walking'];
const budgetOptions: ItineraryRequest['budget'][] = ['Budget-Friendly', 'Mid-Range', 'Luxury'];
const paceOptions: ItineraryRequest['pace'][] = ['Relaxed', 'Balanced', 'Fast-paced'];
const travelerTypeOptions: ItineraryRequest['travelerType'][] = ['Solo', 'Couple', 'Family with kids', 'Group of friends'];


const ItineraryForm: React.FC<ItineraryFormProps> = ({ onGenerate, isLoading, userEmail }) => {
    const [destination, setDestination] = useState('');
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formState, setFormState] = useState<Omit<ItineraryRequest, 'destination'>>({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        numberOfTravelers: '2',
        interests: ['History', 'Food & Drink'],
        budget: 'Mid-Range',
        pace: 'Balanced',
        travelerType: 'Couple',
        foodPreferences: '',
        transportMode: ['Public Transit', 'Walking'],
    });

    const debouncedGetSuggestions = useCallback(debounce(getPlaceSuggestions, 300), []);

    useEffect(() => {
        if (destination.length > 2) {
            setIsSuggestionsLoading(true);
            setShowSuggestions(true);
            debouncedGetSuggestions(destination).then(results => {
                setSuggestions(results);
                setIsSuggestionsLoading(false);
            });
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [destination, debouncedGetSuggestions]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCheckboxChange = (group: 'interests' | 'transportMode', value: string) => {
        setFormState(prevState => {
            const currentValues = prevState[group] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(item => item !== value)
                : [...currentValues, value];
            return { ...prevState, [group]: newValues };
        });
    };

    const handleSuggestionClick = (name: string) => {
        setDestination(name);
        setShowSuggestions(false);
        setSuggestions([]);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination.trim()) {
            alert("Please enter a destination.");
            return;
        }
        onGenerate({ destination, ...formState });
    };

    return (
        <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-gray-200/80">
            <header className="text-center mb-8">
                <div className="inline-flex items-center space-x-2">
                    <CompassIcon className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI Itinerary Planner
                    </h1>
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-center space-x-3">
                        <SparklesIcon className="w-7 h-7 text-purple-500" />
                        <h2 className="text-3xl font-bold text-gray-800">Plan Your Next Adventure</h2>
                    </div>
                    <p className="text-gray-600 mt-2">Tell us your travel preferences, and we'll craft the perfect itinerary for you.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Destination */}
                <div className="relative">
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <div className="relative">
                        <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            id="destination"
                            name="destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            onFocus={() => destination.length > 2 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="e.g., Paris, France"
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            required
                            autoComplete="off"
                        />
                    </div>
                    {showSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isSuggestionsLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((s, i) => (
                                    <div key={i} onMouseDown={() => handleSuggestionClick(s.name)} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                        <img src={s.imageUrl} alt={s.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                                        <span className="font-medium text-gray-700">{s.name}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">No suggestions found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Dates & Travelers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" id="startDate" name="startDate" value={formState.startDate} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" id="endDate" name="endDate" value={formState.endDate} onChange={handleInputChange} min={formState.startDate} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="numberOfTravelers" className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                        <input type="number" id="numberOfTravelers" name="numberOfTravelers" value={formState.numberOfTravelers} onChange={handleInputChange} min="1" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                    </div>
                </div>

                {/* Interests */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {interestsOptions.map(interest => (
                            <label key={interest} className={`flex items-center justify-start space-x-2 pl-3 pr-2 py-2 rounded-lg border text-sm font-medium transition cursor-pointer ${formState.interests.includes(interest) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'}`}>
                                <input
                                    type="checkbox"
                                    value={interest}
                                    checked={formState.interests.includes(interest)}
                                    onChange={() => handleCheckboxChange('interests', interest)}
                                    className="sr-only"
                                />
                                {formState.interests.includes(interest) ? <CheckSquareIcon className="w-4 h-4 flex-shrink-0" /> : <SquareIcon className="w-4 h-4 flex-shrink-0" />}
                                <span>{interest}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Budget, Pace, Traveler Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                        <select id="budget" name="budget" value={formState.budget} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            {budgetOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pace" className="block text-sm font-medium text-gray-700 mb-1">Pace</label>
                        <select id="pace" name="pace" value={formState.pace} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            {paceOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="travelerType" className="block text-sm font-medium text-gray-700 mb-1">Traveler Type</label>
                        <select id="travelerType" name="travelerType" value={formState.travelerType} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            {travelerTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                {/* More Options */}
                <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <summary className="font-medium text-gray-700 cursor-pointer">More Options</summary>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {transportOptions.map(transport => (
                                    <label key={transport} className={`flex items-center justify-start space-x-2 pl-3 pr-2 py-2 rounded-lg border text-sm font-medium transition cursor-pointer ${formState.transportMode.includes(transport) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'}`}>
                                        <input
                                            type="checkbox"
                                            value={transport}
                                            checked={formState.transportMode.includes(transport)}
                                            onChange={() => handleCheckboxChange('transportMode', transport)}
                                            className="sr-only"
                                        />
                                        {formState.transportMode.includes(transport) ? <CheckSquareIcon className="w-4 h-4 flex-shrink-0" /> : <SquareIcon className="w-4 h-4 flex-shrink-0" />}
                                        <span>{transport}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="foodPreferences" className="block text-sm font-medium text-gray-700 mb-1">Food Preferences (optional)</label>
                            <input type="text" id="foodPreferences" name="foodPreferences" value={formState.foodPreferences} onChange={handleInputChange} placeholder="e.g., Vegan, Gluten-Free" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>
                    </div>
                </details>

                {/* Submit Button */}
                <div className="pt-2 text-center">
                    <button
                        type="submit"
                        disabled={isLoading || !destination}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>{isLoading ? 'Crafting Your Trip...' : 'Generate Itinerary'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ItineraryForm;