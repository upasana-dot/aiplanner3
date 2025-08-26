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
    duration: { type: Type.STRING, description: "The date range of the trip, e.g., 'October 26, 2024 - November 2, 2024'." },
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
                imagePrompt: { type: Type.STRING, description: "A descriptive prompt for a photorealistic image representing this activity. Example: 'A stunning, high-resolution photo of the Eiffel Tower from the Trocadéro Gardens at sunset'."},
                estimatedCost: { type: Type.STRING, description: "Estimated cost for the activity (e.g., '~$25 per person', 'Free entry', '$$$')." },
                openingHours: { type: Type.STRING, description: "Opening and closing hours if applicable (e.g., '9:00 AM - 5:00 PM', '24 Hours', 'Varies')." },
                mapUrl: { type: Type.STRING, description: "A direct Google Maps URL for the activity's location." },
                travelInfo: { type: Type.STRING, description: "Estimated travel time and mode from the previous activity to this one. For the first activity of the day, this can be brief, like 'From your accommodation'."}
              },
              required: ["time", "description", "imagePrompt", "estimatedCost", "openingHours", "mapUrl", "travelInfo"],
            },
          },
        },
        required: ["day", "title", "activities"],
      },
    },
    musicSuggestion: {
        type: Type.OBJECT,
        description: "A music suggestion themed to the destination.",
        properties: {
            theme: { type: Type.STRING, description: "A short description of the music theme. E.g., 'Peaceful Krishna Bhajans', 'Epic Shiva Chants for Meditation', 'Relaxing Parisian Cafe Accordion Music'."},
            search_query: {
                type: Type.STRING,
                description: "A concise search query to find this type of music on a platform like YouTube. E.g., 'instrumental krishna bhajans', 'kedarnath shiva chants', 'french accordion cafe music'."
            }
        },
        required: ["theme", "search_query"],
    },
    safetyTips: {
      type: Type.ARRAY,
      description: "A list of 3-5 important, location-specific safety tips for the destination.",
      items: { type: Type.STRING }
    },
    culturalEtiquette: {
      type: Type.ARRAY,
      description: "A list of 3-5 key cultural etiquette points to be aware of at the destination.",
      items: { type: Type.STRING }
    },
    localEmergencyContacts: {
      type: Type.ARRAY,
      description: "A list of essential local emergency contacts (e.g., Police, Ambulance).",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the service (e.g., 'Police', 'Ambulance', 'Tourist Help')." },
          number: { type: Type.STRING, description: "The contact number." }
        },
        required: ["name", "number"]
      }
    },
    weatherNotes: {
      type: Type.STRING,
      description: "A brief note on the typical weather for the specified dates and advice on what to pack."
    }
  },
  required: ["title", "destination", "duration", "summary", "heroImagePrompt", "dailyPlan", "musicSuggestion", "safetyTips", "culturalEtiquette", "localEmergencyContacts", "weatherNotes"],
};

export const generateItineraryPlan = async (request: ItineraryRequest): Promise<ItineraryData> => {
  const { 
    destination, startDate, endDate, numberOfTravelers, interests, budget, pace, 
    travelerType, foodPreferences, transportMode, accessibilityNeeds 
  } = request;

  const interestsString = interests.join(', ');
  const transportString = transportMode.join(', ');
  const durationString = `${startDate} to ${endDate}`;

  const prompt = `
    You are an expert travel planner AI. Your task is to create a personalized, detailed, and exciting travel itinerary based on the user's specific and comprehensive preferences.
    The response must be structured precisely according to the provided JSON schema.

    User Preferences:
    - Destination: ${destination}
    - Travel Dates: ${durationString}
    - Number of Travelers: ${numberOfTravelers}
    - Traveler Type: ${travelerType}
    - Budget: ${budget}
    - Pace of Travel: ${pace}
    - Main Interests: ${interestsString}
    - Preferred Transportation: ${transportString}
    - Food Preferences: ${foodPreferences || 'None specified'}
    - Accessibility Needs: ${accessibilityNeeds ? 'Yes, requires accessible options' : 'No special requirements'}

    Instructions:
    1.  Create a catchy title and engaging summary for the trip.
    2.  Provide a date range string for the 'duration' field (e.g., "October 26, 2024 - November 2, 2024").
    3.  Create a prompt for a beautiful, cinematic hero image for the destination.
    4.  Develop a day-by-day itinerary. For each day:
        - Provide a creative title.
        - List 3-5 activities, respecting the user's preferred 'pace'.
        - For each activity, you MUST provide:
            - A suggested time.
            - A clear description and optional details.
            - A descriptive photorealistic image prompt.
            - An estimated cost (e.g., '$25', 'Free', '$$').
            - Opening hours ('9 AM - 5 PM', 'Varies', etc.).
            - A full, valid Google Maps URL for the location.
            - Estimated travel time and mode from the previous activity (e.g., "Approx. 15 min walk", "20 min by taxi ($10-15)").
        - Ensure activities are logical, geographically sensible, and align with all user preferences (interests, budget, accessibility).
    5.  Provide a 'musicSuggestion' that fits the destination's vibe.
    6.  Provide a 'weatherNotes' section with packing advice based on the destination and travel dates.
    7.  Provide separate, crucial 'safetyTips' and 'culturalEtiquette' lists (3-5 points each).
    8.  List key 'localEmergencyContacts' with their names and numbers.
    9.  The overall tone must be enthusiastic, helpful, and inspiring.
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

const inspirationalPlacesSchema = {
    type: Type.OBJECT,
    properties: {
        places: {
            type: Type.ARRAY,
            description: "A list of 8 beautiful and diverse travel destinations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The full name of the destination (e.g., 'Kyoto, Japan')." },
                    imagePrompt: { type: Type.STRING, description: "A vibrant, cinematic prompt for an image of this destination. Example: 'A serene Japanese garden in Kyoto with a red pagoda surrounded by cherry blossoms in full bloom, soft morning light.'" },
                },
                required: ["name", "imagePrompt"]
            }
        }
    },
    required: ["places"]
}

export const getInspirationalPlaces = async (): Promise<PlaceSuggestion[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a list of 8 beautiful and diverse travel destinations from around the world. For each, provide its name and a stunning, cinematic image prompt.",
            config: {
                responseMimeType: "application/json",
                responseSchema: inspirationalPlacesSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as { places: { name: string; imagePrompt: string }[] };
        
        if (!parsedData.places) return [];

        const placesWithImages = await Promise.all(
            parsedData.places.map(async (place) => {
                try {
                    const imageBytes = await generateImageForPrompt(place.imagePrompt);
                    return {
                        name: place.name,
                        imageUrl: `data:image/jpeg;base64,${imageBytes}`,
                    };
                } catch (e) {
                    console.error(`Failed to generate image for inspirational place: ${place.name}`, e);
                    return {
                        name: place.name,
                        imageUrl: `https://placehold.co/200x200/e2e8f0/64748b?text=Image`,
                    };
                }
            })
        );
        return placesWithImages;
    } catch (error) {
        console.error("Error fetching inspirational places:", error);
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