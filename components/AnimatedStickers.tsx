import React from 'react';
import { PlaneIcon, TrainIcon, BusIcon, CompassIcon } from './Icons';

const Sticker = ({ icon: Icon, position, size, animationDelay, rotation }: { icon: React.FC<any>, position: any, size: string, animationDelay: string, rotation: string }) => {
    return (
        <div className="absolute text-gray-300/70 animate-float" style={{ ...position, animationDelay, ['--tw-rotate' as any]: rotation }}>
            <Icon className={size} />
        </div>
    );
};

const AnimatedStickers: React.FC = () => {
    const stickers = [
        { icon: PlaneIcon, position: { top: '15%', left: '10%' }, size: 'w-16 h-16', animationDelay: '0s', rotation: '-15deg' },
        { icon: TrainIcon, position: { top: '30%', right: '15%' }, size: 'w-12 h-12', animationDelay: '1.5s', rotation: '5deg' },
        { icon: BusIcon, position: { bottom: '20%', left: '20%' }, size: 'w-14 h-14', animationDelay: '2.5s', rotation: '10deg' },
        { icon: CompassIcon, position: { bottom: '35%', right: '25%' }, size: 'w-10 h-10', animationDelay: '3s', rotation: '-5deg' },
        { icon: PlaneIcon, position: { top: '60%', left: '35%' }, size: 'w-8 h-8', animationDelay: '4s', rotation: '15deg' },
        { icon: TrainIcon, position: { top: '70%', right: '5%' }, size: 'w-10 h-10', animationDelay: '5s', rotation: '-10deg' },
    ];

    return (
        <div className="absolute inset-0 w-full h-full -z-0 overflow-hidden pointer-events-none animate-fade-in">
            {stickers.map((sticker, index) => (
                <Sticker key={index} {...sticker} />
            ))}
        </div>
    );
};

export default AnimatedStickers;