import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ItineraryData, DailyPlan, Activity } from '../types';
import { CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon, MusicIcon, SunIcon } from './Icons';

interface ItineraryDisplayProps {
  itinerary: ItineraryData;
}

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => (
    <div className="flex flex-col bg-gray-50/80 rounded-xl border border-gray-200/80 overflow-hidden shadow-sm">
        {activity.imageUrl && (
            <img src={activity.imageUrl} alt={activity.description} className="w-full h-40 object-cover" />
        )}
        <div className="flex items-start space-x-4 p-4">
            <div className="bg-blue-100 p-2 rounded-full mt-1 flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
                <p className="font-semibold text-gray-500">{activity.time}</p>
                <p className="text-gray-800 font-medium">{activity.description}</p>
                {activity.details && (
                     <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                )}
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


const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const handleDownloadPdf = () => {
    const input = document.getElementById('itinerary-content');
    if (input) {
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`${itinerary.destination.replace(/\s/g, '_')}_Itinerary.pdf`);
      });
    }
  };

  const handleMusicSearch = () => {
    const query = encodeURIComponent(itinerary.musicSuggestion.search_query);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
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
                      <button onClick={handleMusicSearch} className={`p-2 rounded-full transition ${itinerary.heroImageUrl ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'}`} title={`Music: ${itinerary.musicSuggestion.theme}`}>
                          <MusicIcon className="h-5 w-5" />
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
        </div>
    </div>
  );
};

export default ItineraryDisplay;