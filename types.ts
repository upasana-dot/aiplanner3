
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

export interface Soundscape {
    theme: string;
    melody: string[];
}

export interface ItineraryData {
  title:string;
  destination: string;
  duration: string;
  summary: string;
  heroImagePrompt: string;
  heroImageUrl?: string;
  dailyPlan: DailyPlan[];
  soundscape: Soundscape;
}

export interface PlaceSuggestion {
  name: string;
  imageUrl: string;
}