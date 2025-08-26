import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ItineraryData, DailyPlan, Activity } from '../types';
import { playBackgroundMusic, stopBackgroundMusic } from '../utils/soundPlayer';
import { 
    CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon, MusicIcon, SunIcon, DollarSignIcon,
    ExternalLinkIcon, RouteIcon, ShieldIcon, UsersIcon, PhoneIcon, ThermometerIcon 
} from './Icons';

interface ItineraryDisplayProps {
  itinerary: ItineraryData;
}

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => (
    <div className="flex flex-col bg-white/80 rounded-xl border border-gray-200/80 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
        {activity.imageUrl && (
            <div className="relative">
                <img src={activity.imageUrl} alt={activity.description} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <p className="absolute bottom-2 left-3 right-3 text-white font-semibold" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>{activity.description}</p>
            </div>
        )}
        <div className="p-4 space-y-3">
            {!activity.imageUrl && <p className="text-gray-800 font-semibold">{activity.description}</p>}
             <div className="flex items-center space-x-3 text-sm text-gray-600">
                <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span><span className="font-semibold text-gray-700">{activity.time}:</span> {activity.openingHours}</span>
            </div>
            {activity.details && (
                 <p className="text-sm text-gray-600">{activity.details}</p>
            )}
            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                <div className="flex items-center space-x-3 text-gray-600">
                    <DollarSignIcon className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                    <span>{activity.estimatedCost}</span>
                </div>
                 <div className="flex items-center space-x-3 text-gray-600">
                    <RouteIcon className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                    <span>{activity.travelInfo}</span>
                </div>
                <div className="flex items-center space-x-3">
                   <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                   <a href={activity.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center space-x-1">
                        <span>View on Map</span>
                        <ExternalLinkIcon className="h-4 w-4" />
                   </a>
                </div>
            </div>
        </div>
    </div>
);

const DayPlanCard: React.FC<{ dayPlan: DailyPlan }> = ({ dayPlan }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 transition-shadow hover:shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full text-white shadow-lg shadow-blue-500/30">
                <SunIcon className="h-7 w-7" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-500">Day {dayPlan.day}</h3>
                <h2 className="text-2xl font-bold text-gray-800">{dayPlan.title}</h2>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayPlan.activities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
            ))}
        </div>
    </div>
);

const TripEssentials: React.FC<{ itinerary: ItineraryData }> = ({ itinerary }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Essentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/80 p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <ShieldIcon className="h-6 w-6 text-red-500" />
                        <h3 className="font-semibold text-gray-700">Safety Tips</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {itinerary.safetyTips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <UsersIcon className="h-6 w-6 text-blue-500" />
                        <h3 className="font-semibold text-gray-700">Cultural Etiquette</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {itinerary.culturalEtiquette.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-lg border">
                     <div className="flex items-center space-x-2 mb-2">
                        <PhoneIcon className="h-6 w-6 text-green-500" />
                        <h3 className="font-semibold text-gray-700">Emergency Contacts</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                        {itinerary.localEmergencyContacts.map((contact, i) => (
                           <p key={i}><span className="font-medium">{contact.name}:</span> {contact.number}</p>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                        <ThermometerIcon className="h-6 w-6 text-orange-500" />
                        <h3 className="font-semibold text-gray-700">Weather & Packing</h3>
                    </div>
                    <p className="text-sm text-gray-600">{itinerary.weatherNotes}</p>
                </div>
            </div>
        </div>
    );
};


const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    // Cleanup function to stop music when the component unmounts or itinerary changes
    return () => {
        stopBackgroundMusic();
    };
  }, []);

  const handleDownloadPdf = () => {
    const input = document.getElementById('itinerary-content');
    if (input) {
      html2canvas(input, { scale: 2, useCORS: true, backgroundColor: null }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgHeight = pdfWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save(`${itinerary.destination.replace(/\s/g, '_')}_Itinerary.pdf`);
      });
    }
  };

  const handleMusicToggle = () => {
    if (isMusicPlaying) {
        stopBackgroundMusic();
    } else {
        playBackgroundMusic();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleMapSearch = () => {
    const query = encodeURIComponent(itinerary.destination);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="animate-fade-in space-y-8">
        <div id="itinerary-content">
            <header className="bg-white text-center rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-200/80 relative overflow-hidden">
                {itinerary.heroImageUrl && (
                  <div className="relative">
                      <img src={itinerary.heroImageUrl} alt={itinerary.destination} className="w-full h-64 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                  </div>
                )}
                
                <div className={`relative ${itinerary.heroImageUrl ? `p-8 pt-4 text-white -mt-28` : 'p-8'}`}>
                  <div className="absolute top-4 right-4 flex space-x-2">
                      <button onClick={handleMusicToggle} className={`relative p-2 rounded-full transition ${itinerary.heroImageUrl ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'}`} title={isMusicPlaying ? 'Mute Music' : `Play travel music (${itinerary.musicSuggestion.theme})`}>
                          <MusicIcon className="h-5 w-5" />
                          {!isMusicPlaying && (
                             <svg className="absolute top-0 right-0 h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="4" y1="4" x2="20" y2="20"></line>
                             </svg>
                          )}
                      </button>
                      <button onClick={handleDownloadPdf} className={`p-2 rounded-full transition ${itinerary.heroImageUrl ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'}`} title="Download as PDF">
                          <DownloadIcon className="h-5 w-5" />
                      </button>
                  </div>
                  
                  <div style={itinerary.heroImageUrl ? { textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>
                    <h1 className={`text-4xl font-extrabold tracking-tight ${itinerary.heroImageUrl ? 'text-white' : 'text-gray-800'}`}>{itinerary.title}</h1>
                    <div className={`mt-4 flex items-center justify-center space-x-6 ${itinerary.heroImageUrl ? 'text-gray-200' : 'text-gray-600'}`}>
                        <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-5 w-5"/>
                            <button onClick={handleMapSearch} className="hover:underline" title="View on Map">{itinerary.destination}</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5"/>
                            <span>{itinerary.duration}</span>
                        </div>
                    </div>
                  </div>
                  <p className={`mt-6 max-w-2xl mx-auto text-lg ${itinerary.heroImageUrl ? 'text-gray-100' : 'text-gray-700'}`} style={itinerary.heroImageUrl ? { textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>{itinerary.summary}</p>
                </div>
            </header>
            
            <div className="space-y-6 mt-8">
                {itinerary.dailyPlan.map((day) => (
                    <DayPlanCard key={day.day} dayPlan={day} />
                ))}
            </div>

            <TripEssentials itinerary={itinerary} />
        </div>
    </div>
  );
};

export default ItineraryDisplay;