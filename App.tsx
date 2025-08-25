import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ItineraryPlanner from './components/ItineraryPlanner';
import PlaneAnimation from './components/PlaneAnimation';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'loading' | 'dashboard' | 'transitioning' | 'planner'>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        setUserEmail(storedEmail);
        setAppState('planner');
      } else {
        setAppState('dashboard');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (email: string) => {
    setAppState('transitioning');
    setTimeout(() => {
      localStorage.setItem('userEmail', email);
      setUserEmail(email);
      setAppState('planner');
    }, 2500); // Match animation duration
  };
  
  if (appState === 'loading') {
      return <div className="min-h-screen bg-gray-50"></div>; // Render a blank screen during initial check
  }

  return (
    <>
      {(appState === 'dashboard' || appState === 'transitioning') && (
        <Dashboard onLogin={handleLogin} isExiting={appState === 'transitioning'} />
      )}
      {appState === 'transitioning' && <PlaneAnimation />}
      {appState === 'planner' && userEmail && <ItineraryPlanner userEmail={userEmail} />}
    </>
  );
};

export default App;