import React, { useState, useEffect } from 'react';
import Background from './Background';
import ImageGalleryModal from './ImageGalleryModal';
import { playBackgroundMusic, stopBackgroundMusic } from '../utils/soundPlayer';
import { SparklesIcon, MusicIcon, CompassIcon } from './Icons';
import ChatWidget from './ChatWidget';
import FeedbackWidget from './FeedbackWidget';
import AnimatedStickers from './AnimatedStickers';

interface DashboardProps {
    onLogin: (email: string) => void;
    isExiting: boolean;
}

const dashboardVideos = [
    'https://videos.pexels.com/video-files/3129841/3129841-hd_1920_1080_25fps.mp4', // Garden
    'https://videos.pexels.com/video-files/854228/854228-hd_1920_1080_25fps.mp4', // Mountains
    'https://videos.pexels.com/video-files/854734/854734-hd_1920_1080_25fps.mp4', // Beach
    'https://videos.pexels.com/video-files/3254012/3254012-hd_1920_1080_25fps.mp4', // Travel road
];

const Dashboard: React.FC<DashboardProps> = ({ onLogin, isExiting }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showGallery, setShowGallery] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [videoIndex, setVideoIndex] = useState(0);

    useEffect(() => {
        const videoInterval = setInterval(() => {
            setVideoIndex((prevIndex) => (prevIndex + 1) % dashboardVideos.length);
        }, 10000); // Change video every 10 seconds

        // Cleanup music and interval when component unmounts
        return () => {
            stopBackgroundMusic();
            clearInterval(videoInterval);
        };
    }, []);

    const handleMusicToggle = () => {
        if (isMuted) {
            playBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }
        setIsMuted(!isMuted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim() && password.trim()) {
            if (!/\S+@\S+\.\S+/.test(email)) {
                setError('Please enter a valid email address.');
                return;
            }
            setError('');
            onLogin(email);
        } else {
            setError('Please enter your email and password.');
        }
    };

    const dashboardVideoUrl = dashboardVideos[videoIndex];

    return (
        <>
            <div className={`min-h-screen flex flex-col items-center justify-center transition-opacity duration-500 p-4 ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}`}>
                <Background videoUrl={dashboardVideoUrl} isDashboard={true} />
                <AnimatedStickers variant="dashboard" />

                <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-30">
                    <div className="flex items-center space-x-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        <CompassIcon className="h-8 w-8 text-white/90" />
                        <span className="text-xl font-bold text-white tracking-tight">AI Itinerary Planner</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowGallery(true)}
                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition"
                            title="Show inspiring places"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            <span>Inspire Me</span>
                        </button>
                        <button
                            onClick={handleMusicToggle}
                            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition relative"
                            title={isMuted ? "Unmute Music" : "Mute Music"}
                        >
                            <MusicIcon className="w-5 h-5" />
                            {isMuted && (
                                <svg className="absolute top-0 right-0 h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="4" y1="4" x2="20" y2="20"></line>
                                </svg>
                            )}
                        </button>
                    </div>
                </header>

                <div className="relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
                        Your Journey Begins Here
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mt-4 max-w-2xl mx-auto" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                        Discover personalized travel plans crafted by AI. Where to next?
                    </p>

                    <form onSubmit={handleSubmit} className="mt-10 max-w-sm mx-auto">
                        <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-5 py-3 rounded-lg border-none text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-blue-300 transition outline-none"
                                aria-label="Enter your email"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-5 py-3 rounded-lg border-none text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-blue-300 transition outline-none"
                                aria-label="Enter your password"
                            />
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                <span>Begin Your Journey</span>
                            </button>
                        </div>
                        {error && <p className="text-red-300 bg-black/30 px-2 py-1 rounded-md mt-3 text-sm">{error}</p>}
                    </form>
                </div>
            </div>
            {showGallery && <ImageGalleryModal onClose={() => setShowGallery(false)} />}
            {!isExiting && (
                <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end space-y-4">
                    <ChatWidget />
                    <FeedbackWidget />
                </div>
            )}
        </>
    );
};

export default Dashboard;