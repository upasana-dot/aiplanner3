import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent mt-12 py-4">
      <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
        <p>Powered by AI. Your next adventure is just a click away.</p>
        <p>&copy; {new Date().getFullYear()} AI Itinerary Planner. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;