
import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryRequest, ItineraryData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy and descriptive title for the entire trip. Example: 'An Adventurous Week in the Swiss Alps'." },
    destination: { type: Type.STRING, description: "The primary destination city or region." },
    duration: { type: Type.STRING, description: "The total duration of the trip as specified by the user." },
    summary: { type: Type.STRING, description: "A brief, engaging 2-3 sentence summary of the trip plan." },
    dailyPlan: {
      type: Type.ARRAY,
      description: "An array of objects, where each object represents a single day's plan.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER, description: "The day number, starting from 1." },
          title: { type: Type.STRING, description: "A creative title for the day's activities. Example: 'Historic Wonders and Culinary Delights'." },
          activities: {
            type: Type.ARRAY,
            description: "An array of activities for the day.",
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Suggested time for the activity (e.g., '9:00 AM', 'Afternoon', 'Evening')." },
                description: { type: Type.STRING, description: "A concise description of the activity." },
                details: { type: Type.STRING, description: "Optional: A few more details about the activity, like location, tips, or booking info." },
                imagePrompt: { type: Type.STRING, description: "A descriptive prompt for a photorealistic image representing this activity. Example: 'A stunning, high-resolution photo of the Eiffel Tower from the Trocadéro Gardens at sunset'."}
              },
              required: ["time", "description", "imagePrompt"],
            },
          },
        },
        required: ["day", "title", "activities"],
      },
    },
    soundscape: {
        type: Type.OBJECT,
        description: "A sound theme for the destination.",
        properties: {
            theme: { type: Type.STRING, description: "A short description of the soundscape theme. E.g., 'Calm Flute Melody', 'Tropical Beach Ambience'."},
            melody: {
                type: Type.ARRAY,
                description: "A short, simple melody represented by an array of 4-6 musical notes (e.g., 'C4', 'G4'). Use only notes A-G, optional # for sharp, and octave number 3-5.",
                items: { type: Type.STRING }
            }
        },
        required: ["theme", "melody"],
    }
  },
  required: ["title", "destination", "duration", "summary", "dailyPlan", "soundscape"],
};

export const generateItineraryPlan = async (request: ItineraryRequest): Promise<ItineraryData> => {
  const { destination, duration, interests, budget } = request;

  const prompt = `
    You are an expert travel planner. Your task is to create a personalized, detailed, and exciting travel itinerary based on the user's preferences.
    The response must be structured according to the provided JSON schema.

    User Preferences:
    - Destination: ${destination}
    - Trip Duration: ${duration}
    - Interests: ${interests}
    - Budget: ${budget}

    Instructions:
    1.  Create a catchy title for the trip.
    2.  Write a brief, engaging summary of the planned trip.
    3.  Develop a day-by-day itinerary. For each day:
        - Provide a creative title that reflects the day's theme.
        - List 3-5 activities for each day, appropriate for the destination and interests.
        - For each activity, specify a suggested time, a clear description, and a descriptive prompt for generating a photorealistic image.
        - Ensure the plan is logical, geographically sensible, and aligns with the specified budget.
    4.  Create a 'soundscape' for the destination: provide a theme and a simple 4-6 note melody using notes like 'C4', 'F#5', etc.
    5.  The overall tone should be enthusiastic and inspiring.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData: ItineraryData = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};

export const generateImageForPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `${prompt}, cinematic, professional photography, high resolution`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return base64ImageBytes;
    } catch (error) {
        console.error(`Error generating image for prompt "${prompt}":`, error);
        throw new Error("Failed to generate image.");
    }
};
