

export interface ItineraryRequest {
  destination: string;
  duration: string;
  interests: string;
  budget: 'Budget-Friendly' | 'Mid-Range' | 'Luxury';
}

export interface Activity {
  time: string;
  description: string;
  details?: string;
  imagePrompt: string;
  imageUrl?: string;
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
}

export interface PlaceSuggestion {
  name: string;
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}