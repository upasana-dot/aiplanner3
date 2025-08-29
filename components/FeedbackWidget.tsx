import React, { useState } from 'react';
import { FeedbackIcon } from './Icons';
import StarRating from './StarRating';

const FeedbackWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 && !feedback.trim()) return;

        console.log("Feedback submitted:", { rating, feedback });
        setIsSubmitted(true);

        setTimeout(() => {
            setIsOpen(false);
            // Reset state for next time
            setTimeout(() => {
                setIsSubmitted(false);
                setRating(0);
                setFeedback('');
            }, 500)
        }, 2000);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
                aria-label="Leave feedback"
            >
                <FeedbackIcon className="w-8 h-8" />
            </button>
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl animate-fade-in z-40 ring-1 ring-black/5">
                    <header className="bg-gray-100/80 p-4 rounded-t-3xl border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Share Your Feedback</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold text-2xl">&times;</button>
                    </header>

                    {isSubmitted ? (
                        <div className="p-8 text-center">
                            <h4 className="text-2xl font-bold text-emerald-600">Thank You!</h4>
                            <p className="text-gray-600 mt-2">Your feedback helps us improve.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">How would you rate this itinerary?</label>
                                <StarRating rating={rating} onRatingChange={setRating} />
                            </div>
                            <div>
                                <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 mb-1">Any additional thoughts?</label>
                                <textarea
                                    id="feedback-text"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you liked or what could be better..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition"
                            >
                                Submit Feedback
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
};

export default FeedbackWidget;