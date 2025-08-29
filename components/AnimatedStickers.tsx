import React from 'react';
import { PlaneIcon, TrainIcon, BusIcon, CompassIcon, SparklesIcon } from './Icons';

const Sticker = ({ icon: Icon, position, size, animationDelay, rotation, color }: { icon: React.FC<any>, position: any, size: string, animationDelay: string, rotation: string, color: string }) => {
    return (
        <div className={`absolute animate-float ${color}`} style={{ ...position, animationDelay, ['--tw-rotate' as any]: rotation }}>
            <Icon className={size} />
        </div>
    );
};

// Config for dashboard (login page) - Adjusted to match screenshot
const dashboardStickers = [
    { icon: PlaneIcon, position: { top: '25%', left: '36%' }, size: 'w-6 h-6', animationDelay: '0s', rotation: '-20deg', color: 'text-white/80' },
    { icon: SparklesIcon, position: { top: '20%', left: '50%' }, size: 'w-8 h-8', animationDelay: '1.5s', rotation: '15deg', color: 'text-amber-400/80' },
    { icon: CompassIcon, position: { top: '26%', left: '59%' }, size: 'w-7 h-7', animationDelay: '2.5s', rotation: '5deg', color: 'text-teal-300/70' },
];

// Config for planner page
const plannerStickers = [
    { icon: PlaneIcon, position: { top: '15%', left: '10%' }, size: 'w-16 h-16', animationDelay: '0s', rotation: '-15deg', color: 'text-gray-300/70' },
    { icon: TrainIcon, position: { top: '30%', right: '15%' }, size: 'w-12 h-12', animationDelay: '1.5s', rotation: '5deg', color: 'text-gray-300/70' },
    { icon: BusIcon, position: { bottom: '20%', left: '20%' }, size: 'w-14 h-14', animationDelay: '2.5s', rotation: '10deg', color: 'text-gray-300/70' },
    { icon: CompassIcon, position: { bottom: '35%', right: '25%' }, size: 'w-10 h-10', animationDelay: '3s', rotation: '-5deg', color: 'text-gray-300/70' },
    { icon: PlaneIcon, position: { top: '60%', left: '35%' }, size: 'w-8 h-8', animationDelay: '4s', rotation: '15deg', color: 'text-gray-300/70' },
    { icon: TrainIcon, position: { top: '70%', right: '5%' }, size: 'w-10 h-10', animationDelay: '5s', rotation: '-10deg', color: 'text-gray-300/70' },
];

interface AnimatedStickersProps {
    variant?: 'dashboard' | 'planner';
}

const AnimatedStickers: React.FC<AnimatedStickersProps> = ({ variant = 'planner' }) => {
    const stickers = variant === 'dashboard' ? dashboardStickers : plannerStickers;

    return (
        <div className="absolute inset-0 w-full h-full -z-0 overflow-hidden pointer-events-none animate-fade-in">
            {stickers.map((sticker, index) => (
                <Sticker key={index} {...sticker} />
            ))}
        </div>
    );
};

export default AnimatedStickers;