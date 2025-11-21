
import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Ideally this would be inside a function or check for process.env, 
// but per instructions we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const guessDrawing = async (base64Image: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash'; 
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image
            }
          },
          {
            text: "Look at this drawing. Respond with a single JSON object. The format should be { \"guess\": \"what you think it is\", \"confidence\": \"0-100\", \"comment\": \"A short, witty, 1-sentence comment about the artistic quality or what it looks like.\" }."
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Error guessing drawing:", error);
    return JSON.stringify({ guess: "Unknown", confidence: 0, comment: "I'm having trouble seeing that." });
  }
};

export const getPokerCommentary = async (playerHand: string, board: string, action: string, potSize: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a witty, slightly sarcastic poker opponent. 
      The player holds: ${playerHand}. 
      The board is: ${board}. 
      The player just: ${action}. 
      Pot size: ${potSize}.
      Make a short, 1-sentence comment. If they bluffed, act suspicious. If they have a good hand, act nervous or impressed. Keep it under 15 words.`,
    });
    return response.text || "...";
  } catch (error) {
    console.error("Error getting poker commentary:", error);
    return "Interesting move...";
  }
};

export const generatePartyPrompt = async (category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a creative, fun, and unique prompt for the party game category: "${category}". 
      If it's "Never Have I Ever", start with "Never have I ever...".
      If it's "Truth", ask a probing but fun personal question.
      If it's "Dare", give a physical or social challenge suitable for a room.
      If it's "Would You Rather", give two difficult options.
      Keep it safe for work but entertaining. Output ONLY the prompt text.`,
    });
    return response.text || "Take a sip of water.";
  } catch (error) {
    console.error("Error generating party prompt:", error);
    return "Tell us a joke.";
  }
};
