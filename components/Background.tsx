import React from 'react';

interface BackgroundProps {
  videoUrl: string | null;
}

const Background: React.FC<BackgroundProps> = ({ videoUrl }) => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-gray-50 transition-opacity duration-1000">
      {videoUrl ? (
        <video
          key={videoUrl}
          className="w-full h-full object-cover animate-fade-in"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50"></div>
      )}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
    </div>
  );
};

export default Background;