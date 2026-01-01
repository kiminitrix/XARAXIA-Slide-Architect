
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Deck, LayoutType, ThemeType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SLIDE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The main title of the deck" },
    theme: { type: Type.STRING, enum: Object.values(ThemeType), description: "Recommended theme based on content" },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slide_title: { type: Type.STRING },
          slide_content: { type: Type.ARRAY, items: { type: Type.STRING } },
          visual_suggestion: { type: Type.STRING, description: "A detailed prompt for image generation or icon suggestion" },
          layout_type: { type: Type.STRING, enum: Object.values(LayoutType) },
          presenter_notes: { type: Type.STRING }
        },
        required: ["slide_title", "slide_content", "visual_suggestion", "layout_type", "presenter_notes"]
      }
    }
  },
  required: ["title", "theme", "slides"]
};

export const generateDeck = async (input: string, fileData?: { data: string, mimeType: string }): Promise<Deck> => {
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    You are the "XARAXIA Slide Architect," an expert AI specialized in converting multi-format data into structured slide decks.
    1. Content Fidelity: 100% accuracy. Rebuild, don't just summarize.
    2. Structure: 
       - Slide 1: Title Slide
       - Slide 2: Agenda
       - Body Slides: Broken down paragraphs into impactful bullets.
    3. Visuals: Provide specific descriptions for imagery/icons.
    4. Design: Choose a theme (Corporate, Vibrant, Minimalist, Tech) and layout (Two-column, Comparison, etc.) appropriately.
    5. Notes: Include detailed presenter notes for context.
    Return the response strictly as JSON.
  `;

  const parts: any[] = [{ text: input || "Analyze the provided content and build a comprehensive slide deck." }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data.split(',')[1],
        mimeType: fileData.mimeType
      }
    });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: SLIDE_SCHEMA
    }
  });

  if (!response.text) {
    throw new Error("Empty response from AI");
  }

  return JSON.parse(response.text) as Deck;
};

export const generateSlideImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional slide background or illustration for: ${prompt}. High quality, clean design.` }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      },
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image generation failed", e);
  }
  return null;
};
