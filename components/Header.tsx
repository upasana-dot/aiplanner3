import React from 'react';
import { CompassIcon } from './Icons';

const Header: React.FC = () => {
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center space-x-3">
                    <CompassIcon className="h-8 w-8 text-blue-600" />
                    <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI Itinerary Planner
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;