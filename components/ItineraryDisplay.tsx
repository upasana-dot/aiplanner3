import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ItineraryData, DailyPlan, Activity } from '../types';
import { playMelody } from '../utils/soundPlayer';
import { CalendarIcon, ClockIcon, DownloadIcon, MapPinIcon, MusicIcon, SunIcon } from './Icons';

interface ItineraryDisplayProps {
  itinerary: ItineraryData;
}

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => (
    <div className="flex flex-col bg-slate-50/80 rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
        {activity.imageUrl && (
            <img src={activity.imageUrl} alt={activity.description} className="w-full h-40 object-cover" />
        )}
        <div className="flex items-start space-x-4 p-4">
            <div className="bg-blue-100 p-2 rounded-full mt-1 flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
                <p className="font-semibold text-slate-500">{activity.time}</p>
                <p className="text-slate-800 font-medium">{activity.description}</p>
                {activity.details && (
                     <p className="text-sm text-slate-500 mt-1">{activity.details}</p>
                )}
            </div>
        </div>
    </div>
);

const DayPlanCard: React.FC<{ dayPlan: DailyPlan }> = ({ dayPlan }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 transition-shadow hover:shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full text-white shadow-lg shadow-blue-500/30">
                <SunIcon className="h-7 w-7" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-500">Day {dayPlan.day}</h3>
                <h2 className="text-2xl font-bold text-slate-800">{dayPlan.title}</h2>
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

  const handlePlaySound = () => {
    playMelody(itinerary.soundscape.melody);
  };

  return (
    <div className="animate-fade-in space-y-8">
        <div id="itinerary-content">
            <header className="text-center bg-white p-8 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 relative">
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button onClick={handlePlaySound} className="p-2 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition" title={`Play Soundscape: ${itinerary.soundscape.theme}`}>
                        <MusicIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handleDownloadPdf} className="p-2 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition" title="Download as PDF">
                        <DownloadIcon className="h-5 w-5" />
                    </button>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{itinerary.title}</h1>
                <div className="mt-4 flex items-center justify-center space-x-6 text-slate-600">
                    <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-5 w-5 text-slate-500"/>
                        <span>{itinerary.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-slate-500"/>
                        <span>{itinerary.duration}</span>
                    </div>
                </div>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700">{itinerary.summary}</p>
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