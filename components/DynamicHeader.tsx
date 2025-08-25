import React from 'react';
import { PlaneIcon, TrainIcon, BusIcon } from './Icons';

const DynamicHeader: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-32 overflow-x-hidden pointer-events-none z-20">
      <div
        className="absolute top-8 animate-move-across"
        style={{ animationDuration: '20s', animationDelay: '0s' }}
      >
        <PlaneIcon className="w-12 h-12 text-sky-300/90" />
      </div>
      <div
        className="absolute top-16 animate-move-across"
        style={{ animationDuration: '30s', animationDelay: '5s' }}
      >
        <TrainIcon className="w-10 h-10 text-emerald-300/80" />
      </div>
      <div
        className="absolute top-6 animate-move-across"
        style={{ animationDuration: '25s', animationDelay: '10s' }}
      >
        <BusIcon className="w-10 h-10 text-amber-300/70" />
      </div>
       <div
        className="absolute top-20 animate-move-across"
        style={{ animationDuration: '18s', animationDelay: '15s' }}
      >
        <PlaneIcon className="w-8 h-8 text-indigo-300/90" />
      </div>
    </div>
  );
};

export default DynamicHeader;