import React from 'react';
import { GlobeIcon, MapPinIcon } from './Icons';

interface GlobeLoaderProps {
    destination: string;
}

const GlobeLoader: React.FC<GlobeLoaderProps> = ({ destination }) => {
    return (
        <div className="flex flex-col items-center justify-center p-10 text-center animate-fade-in">
            <div className="relative w-32 h-32">
                <GlobeIcon className="w-full h-full text-blue-500 animate-globe-spin" />
                <MapPinIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-800">Plotting your course...</h2>
            {destination && <p className="mt-1 text-gray-500">Destination: <span className="font-bold text-gray-700">{destination}</span></p>}
        </div>
    );
};

export default GlobeLoader;