import React, { useState, useEffect } from 'react';
import { getInspirationalPlaces } from '../services/geminiService';
import { PlaceSuggestion } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ImageGalleryModalProps {
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ onClose }) => {
  const [places, setPlaces] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const result = await getInspirationalPlaces();
        setPlaces(result);
      } catch (error) {
        console.error("Failed to load inspirational places:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-300 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Inspiring Destinations</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition text-2xl font-bold">&times;</button>
        </header>
        <div className="p-4 sm:p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner message="Generating beautiful destinations..." />
            </div>
          ) : places.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {places.map((place, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden group shadow-lg aspect-square">
                  <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <p className="absolute bottom-2 left-2 right-2 text-white font-semibold text-sm drop-shadow-md">{place.name}</p>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center text-gray-500 py-16">
                <p>Could not load destinations at this time.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;