import React, { useState, useEffect } from 'react';
import { ItineraryData, ItineraryRequest } from './types';
import { generateItineraryPlan, generateImageForPrompt, generateVideoForDestination, generateRandomTravelVideo } from './services/geminiService';
import Header from './components/Header';
import ItineraryForm from './components/ItineraryForm';
import LoadingSpinner from './components/LoadingSpinner';
import ItineraryDisplay from './components/ItineraryDisplay';
import Footer from './components/Footer';
import { GlobeIcon } from './components/Icons';
import Background from './components/Background';
import AnimatedStickers from './components/AnimatedStickers';
import GlobeLoader from './components/GlobeLoader';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGlobeLoading, setIsGlobeLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string | null>(null);
  const [currentDestination, setCurrentDestination] = useState<string>('');

  useEffect(() => {
    const fetchInitialVideo = async () => {
      // Fetch a random video for the initial background
      const randomVideoUrl = await generateRandomTravelVideo(() => {}).catch(err => {
        console.error("Initial video generation failed:", err);
        return null;
      });
      // Fallback to a static video if generation fails.
      const finalUrl = randomVideoUrl || 'https://videos.pexels.com/video-files/3254012/3254012-hd_1920_1080_25fps.mp4';
      setBackgroundVideoUrl(finalUrl);
    };

    fetchInitialVideo();
  }, []);

  const handleGenerateItinerary = async (request: ItineraryRequest) => {
    setIsLoading(true);
    setIsGlobeLoading(true);
    setCurrentDestination(request.destination);
    setError(null);
    setItinerary(null);
    
    try {
      const plan = await generateItineraryPlan(request);
      setIsGlobeLoading(false);

      setLoadingMessage("Generating stunning visuals for your trip...");
      const activitiesWithPrompts = plan.dailyPlan.flatMap(day => day.activities);
      
      const imagePromises = activitiesWithPrompts.map(activity => 
        generateImageForPrompt(activity.imagePrompt).catch(e => {
          console.error(`Failed to generate image for: ${activity.description}`, e);
          return null; // Return null on failure to not break Promise.all
        })
      );
      
      const heroImagePromise = generateImageForPrompt(plan.heroImagePrompt).catch(e => {
          console.error(`Failed to generate hero image for: ${request.destination}`, e);
          return null;
      });

      const videoPromise = generateVideoForDestination(request.destination, (progressMsg) => {
        setLoadingMessage(`Creating cinematic preview: ${progressMsg}`);
      }).catch(err => {
          console.error("Video generation failed:", err);
          return null;
      });

      const [generatedImages, heroImage, videoUrl] = await Promise.all([
        Promise.all(imagePromises),
        heroImagePromise,
        videoPromise
      ]);

      if (videoUrl) {
        // Revoke the previous blob URL to prevent memory leaks before setting the new one.
        setBackgroundVideoUrl(currentUrl => {
            if (currentUrl && currentUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentUrl);
            }
            return videoUrl;
        });
      }

      let imageIndex = 0;
      const itineraryWithImages: ItineraryData = {
        ...plan,
        heroImageUrl: heroImage ? `data:image/jpeg;base64,${heroImage}` : undefined,
        dailyPlan: plan.dailyPlan.map(day => ({
          ...day,
          activities: day.activities.map(activity => {
            const imageUrl = generatedImages[imageIndex];
            imageIndex++;
            return { ...activity, imageUrl: imageUrl ? `data:image/jpeg;base64,${imageUrl}` : undefined };
          })
        }))
      };

      setItinerary(itineraryWithImages);

    } catch (err) {
      console.error(err);
      setError('Failed to generate itinerary. Please check your inputs or API key and try again.');
    } finally {
      setIsLoading(false);
      setIsGlobeLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen text-gray-800 flex flex-col relative">
      <Background videoUrl={backgroundVideoUrl} />
      {!isLoading && !itinerary && <AnimatedStickers />}
      
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center z-0">
        <ItineraryForm onGenerate={handleGenerateItinerary} isLoading={isLoading} />
        <div className="w-full max-w-4xl mt-12">
          {isGlobeLoading && <GlobeLoader destination={currentDestination} />}
          {isLoading && !isGlobeLoading && <LoadingSpinner message={loadingMessage} />}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative text-center" role="alert">
              <strong className="font-bold">Oops! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {itinerary ? (
            <ItineraryDisplay itinerary={itinerary} />
          ) : (
            !isLoading && !error && (
              <div className="text-center text-gray-500 py-16 px-6 bg-white/60 rounded-2xl shadow-sm border border-gray-200">
                <GlobeIcon className="mx-auto h-16 w-16 text-blue-500" />
                <h2 className="mt-4 text-2xl font-semibold text-gray-700">Your Adventure Awaits</h2>
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