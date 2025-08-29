import React, { useState, useEffect } from 'react';
import { ItineraryData, ItineraryRequest } from '../types';
import { generateItineraryPlan, generateImageForPrompt, generateVideoForDestination, generateRandomTravelVideo } from '../services/geminiService';
import ItineraryForm from './ItineraryForm';
import LoadingSpinner from './LoadingSpinner';
import ItineraryDisplay from './ItineraryDisplay';
import Footer from './Footer';
import { GlobeIcon } from './Icons';
import Background from './Background';
import GlobeLoader from './GlobeLoader';
import ChatWidget from './ChatWidget';
import FeedbackWidget from './FeedbackWidget';

interface ItineraryPlannerProps {
    userEmail: string;
}

const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ userEmail }) => {
    const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGlobeLoading, setIsGlobeLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string | null>(null);
    const [currentDestination, setCurrentDestination] = useState<string>('');
    const [showResults, setShowResults] = useState(false);

    // Effect to manage the lifecycle of blob URLs to prevent memory leaks.
    useEffect(() => {
        // This cleanup function will run when the component unmounts or before this effect re-runs.
        // It revokes the object URL to free up memory.
        return () => {
            if (backgroundVideoUrl && backgroundVideoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(backgroundVideoUrl);
            }
        };
    }, [backgroundVideoUrl]);

    const handleGenerateItinerary = async (request: ItineraryRequest) => {
        setIsLoading(true);
        setIsGlobeLoading(true);
        setCurrentDestination(request.destination);
        setError(null);
        setItinerary(null);
        setShowResults(false);

        // Generate and set the background video for the results page in parallel
        generateVideoForDestination(request.destination, (progressMsg) => {
            setLoadingMessage(`Creating cinematic preview: ${progressMsg}`);
        }).catch(err => {
            console.error("Video generation failed, using fallback:", err);
            return 'https://videos.pexels.com/video-files/3254012/3254012-hd_1920_1080_25fps.mp4';
        }).then(videoUrl => {
            if (videoUrl) {
                setBackgroundVideoUrl(videoUrl);
            }
        });

        try {
            const plan = await generateItineraryPlan(request);
            setIsGlobeLoading(false);

            setLoadingMessage("Generating stunning visuals for your trip...");
            const activitiesWithPrompts = plan.dailyPlan.flatMap(day => day.activities);

            const imagePromises = activitiesWithPrompts.map(activity =>
                generateImageForPrompt(activity.imagePrompt).catch(e => {
                    console.error(`Failed to generate image for: ${activity.description}`, e);
                    return null;
                })
            );

            const heroImagePromise = generateImageForPrompt(plan.heroImagePrompt).catch(e => {
                console.error(`Failed to generate hero image for: ${request.destination}`, e);
                return null;
            });

            const [generatedImages, heroImage] = await Promise.all([
                Promise.all(imagePromises),
                heroImagePromise,
            ]);

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
            setShowResults(true);

        } catch (err) {
            console.error(err);
            setError('Failed to generate itinerary. Please check your inputs or API key and try again.');
        } finally {
            setIsLoading(false);
            setIsGlobeLoading(false);
            setLoadingMessage('');
        }
    };

    if (showResults && itinerary) {
        return (
            <div className="min-h-screen text-gray-800 flex flex-col relative animate-fade-in">
                <Background videoUrl={backgroundVideoUrl} />
                <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center z-0">
                    <div className="w-full max-w-4xl">
                        <ItineraryDisplay itinerary={itinerary} />
                    </div>
                </main>
                <Footer />
                <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end space-y-4">
                    <ChatWidget destination={itinerary.destination} />
                    <FeedbackWidget />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <main className="container mx-auto px-4 py-12 sm:py-16 flex flex-col items-center">
                <ItineraryForm onGenerate={handleGenerateItinerary} isLoading={isLoading} userEmail={userEmail} />
                <div className="w-full max-w-4xl mt-12">
                    {isGlobeLoading && <GlobeLoader destination={currentDestination} />}
                    {isLoading && !isGlobeLoading && <LoadingSpinner message={loadingMessage} />}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative text-center" role="alert">
                            <strong className="font-bold">Oops! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {!isLoading && !error && (
                        <div className="text-center text-gray-500 pt-10">
                            <GlobeIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-md">Your next adventure is just a few clicks away.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ItineraryPlanner;