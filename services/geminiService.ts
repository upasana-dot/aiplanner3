import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryRequest, ItineraryData, PlaceSuggestion } from '../types';

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
    heroImagePrompt: { type: Type.STRING, description: "A stunning, cinematic, and photorealistic image prompt for the main destination. Example: 'A breathtaking panoramic aerial shot of the Santorini coastline at sunset, with whitewashed villages and blue domes.'" },
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
  required: ["title", "destination", "duration", "summary", "heroImagePrompt", "dailyPlan", "soundscape"],
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
    3.  Create a prompt for a beautiful hero image for the destination.
    4.  Develop a day-by-day itinerary. For each day:
        - Provide a creative title that reflects the day's theme.
        - List 3-5 activities for each day. The activities must be appropriate for the destination and user interests.
        - The list of activities must include famous landmarks, historical sites, and unique cultural experiences specific to the destination (e.g., for Mathura, this could include the Krishna Janmabhoomi Temple and an evening aarti ceremony).
        - For each activity, specify a suggested time, a clear description, and a descriptive prompt for generating a photorealistic image.
        - Ensure the plan is logical, geographically sensible, and aligns with the specified budget.
    5.  Create a 'soundscape' for the destination: provide a theme and a simple 4-6 note melody using notes like 'C4', 'F#5', etc.
    6.  The overall tone should be enthusiastic and inspiring.
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

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "A list of 5 potential travel destinations based on the user's query.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The full name of the suggested destination (e.g., 'Paris, France')." },
                    imagePrompt: { type: Type.STRING, description: "A vibrant and appealing prompt to generate an image for this destination. Example: 'A beautiful watercolor painting of the Eiffel Tower at sunset'." },
                },
                required: ["name", "imagePrompt"]
            }
        }
    },
    required: ["suggestions"]
}

export const getPlaceSuggestions = async (query: string): Promise<PlaceSuggestion[]> => {
    if (!query.trim()) {
        return [];
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the user query "${query}", generate a list of 5 travel destination suggestions. Provide a descriptive prompt to generate an image for each.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as { suggestions: { name: string; imagePrompt: string }[] };
        
        if (!parsedData.suggestions) return [];

        const suggestionsWithImages = await Promise.all(
            parsedData.suggestions.map(async (suggestion) => {
                try {
                    const imageBytes = await generateImageForPrompt(suggestion.imagePrompt);
                    return {
                        name: suggestion.name,
                        imageUrl: `data:image/jpeg;base64,${imageBytes}`,
                    };
                } catch (e) {
                    console.error(`Failed to generate image for suggestion: ${suggestion.name}`, e);
                    return {
                        name: suggestion.name,
                        imageUrl: `https://placehold.co/100x100/e2e8f0/64748b?text=Image`,
                    };
                }
            })
        );
        return suggestionsWithImages;
    } catch (error) {
        console.error("Error fetching place suggestions:", error);
        return [];
    }
};

const generateAndPollVideo = async (videoPrompt: string, onProgress: (message: string) => void): Promise<string | null> => {
    try {
        onProgress("Warming up the virtual cameras...");
        let operation = await ai.models.generateVideos({
          model: 'veo-2.0-generate-001',
          prompt: videoPrompt,
          config: { numberOfVideos: 1 }
        });
        
        onProgress("Scouting the best locations...");
        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({operation: operation});
          onProgress("Rendering your cinematic view...");
        }

        onProgress("Finalizing the video...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video URI not found.");
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
        
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error(`Error during video generation for prompt "${videoPrompt}":`, error);
        return null;
    }
};

export const generateRandomTravelVideo = async (onProgress: (message: string) => void): Promise<string | null> => {
    try {
        const promptResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Give me a single, concise prompt for generating a beautiful, cinematic, high-resolution aerial view video of a random, scenic, and peaceful travel destination in the world. Only return the prompt text itself, nothing else. For example: 'A beautiful, cinematic, high-resolution aerial view of the lavender fields in Provence, France. Peaceful and scenic.'",
        });
        const videoPrompt = promptResponse.text.trim();
        return await generateAndPollVideo(videoPrompt, onProgress);
    } catch(error) {
        console.error(`Error generating random travel video prompt:`, error);
        return null;
    }
};

export const generateVideoForDestination = async (destination: string, onProgress: (message: string) => void): Promise<string | null> => {
    const videoPrompt = `A beautiful, cinematic, high-resolution aerial view of ${destination}. Peaceful and scenic.`;
    return await generateAndPollVideo(videoPrompt, onProgress);
};