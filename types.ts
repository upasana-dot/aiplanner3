

export interface ItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: string;
  interests: string[];
  budget: 'Budget-Friendly' | 'Mid-Range' | 'Luxury';
  pace: 'Relaxed' | 'Balanced' | 'Fast-paced';
  travelerType: 'Solo' | 'Couple' | 'Family with kids' | 'Group of friends';
  foodPreferences: string;
  transportMode: string[];
  accessibilityNeeds: boolean;
}

export interface Activity {
  time: string;
  description: string;
  details?: string;
  imagePrompt: string;
  imageUrl?: string;
  estimatedCost: string;
  openingHours: string;
  mapUrl: string;
  travelInfo: string;
}

export interface DailyPlan {
  day: number;
  title: string;
  activities: Activity[];
}

export interface MusicSuggestion {
    theme: string;
    search_query: string;
}

export interface ItineraryData {
  title:string;
  destination: string;
  duration: string;
  summary: string;
  heroImagePrompt: string;
  heroImageUrl?: string;
  dailyPlan: DailyPlan[];
  musicSuggestion: MusicSuggestion;
  safetyTips: string[];
  culturalEtiquette: string[];
  localEmergencyContacts: { name: string; number: string; }[];
  weatherNotes: string;
}

export interface PlaceSuggestion {
  name: string;
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}