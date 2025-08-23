import React, { useState } from 'react';
import { ItineraryData, ItineraryRequest } from './types';
import { generateItineraryPlan, generateImageForPrompt } from './services/geminiService';
import Header from './components/Header';
import ItineraryForm from './components/ItineraryForm';
import LoadingSpinner from './components/LoadingSpinner';
import ItineraryDisplay from './components/ItineraryDisplay';
import Footer from './components/Footer';
import { GlobeIcon } from './components/Icons';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateItinerary = async (request: ItineraryRequest) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    try {
      setLoadingMessage("Crafting your personalized itinerary...");
      const plan = await generateItineraryPlan(request);

      setLoadingMessage("Generating stunning visuals for your trip...");
      const activitiesWithPrompts = plan.dailyPlan.flatMap(day => day.activities);
      
      const imagePromises = activitiesWithPrompts.map(activity => 
        generateImageForPrompt(activity.imagePrompt).catch(e => {
          console.error(`Failed to generate image for: ${activity.description}`, e);
          return null; // Return null on failure to not break Promise.all
        })
      );
      const generatedImages = await Promise.all(imagePromises);

      let imageIndex = 0;
      const itineraryWithImages: ItineraryData = {
        ...plan,
        dailyPlan: plan.dailyPlan.map(day => ({
          ...day,
          activities: day.activities.map(activity => {
            const imageUrl = generatedImages[imageIndex];
            imageIndex++;
            return { ...activity, imageUrl: imageUrl ? `data:image/png;base64,${imageUrl}` : undefined };
          })
        }))
      };

      setItinerary(itineraryWithImages);

    } catch (err) {
      console.error(err);
      setError('Failed to generate itinerary. Please check your inputs or API key and try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(147,197,253,0.1),_transparent_40%)]"></div>
      </div>

      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <ItineraryForm onGenerate={handleGenerateItinerary} isLoading={isLoading} />
        <div className="w-full max-w-4xl mt-12">
          {isLoading && <LoadingSpinner message={loadingMessage} />}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
              <strong className="font-bold">Oops! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {itinerary ? (
            <ItineraryDisplay itinerary={itinerary} />
          ) : (
            !isLoading && !error && (
              <div className="text-center text-slate-500 py-16 px-6 bg-white/60 rounded-2xl shadow-sm border border-slate-200">
                <GlobeIcon className="mx-auto h-16 w-16 text-blue-500" />
                <h2 className="mt-4 text-2xl font-semibold text-slate-700">Your Adventure Awaits</h2>
                <p className="mt-2 text-md">Fill out the form above to generate your personalized travel plan.</p>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;