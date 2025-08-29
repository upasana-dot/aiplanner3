import React from 'react';
import { PlaneIcon } from './Icons';

const PlaneAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
            <div className="absolute animate-fly-across" style={{ top: '100%', left: 0 }}>
                <PlaneIcon className="w-20 h-20 md:w-32 md:h-32 text-white opacity-90 drop-shadow-2xl" />
            </div>
        </div>
    );
};

export default PlaneAnimation;