
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, ColorPalette } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export async function analyzeFaceAndColors(base64Data: string): Promise<AnalysisResult> {
  const model = 'gemini-2.5-flash';
  const imagePart = fileToGenerativePart(base64Data, 'image/jpeg');
  
  const prompt = "Analyze the person in this image. Identify their face shape from one of the following options: Oval, Round, Square, Heart, Diamond, or Long. Also, based on their skin tone, suggest 3 complementary clothing color palettes. Each palette should have a creative name (e.g., 'Earthy Warmth') and an array of 4 hex color codes. Return the response as a single JSON object.";
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      faceShape: { type: Type.STRING },
      colorPalettes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['name', 'colors'],
        },
      },
    },
    required: ['faceShape', 'colorPalettes'],
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
        responseMimeType: "application/json",
        responseSchema,
    },
  });

  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as AnalysisResult;
}

const hairstylePrompts = (faceShape: string) => [
    `Generate a new image of the person with a stylish long layered haircut suitable for a ${faceShape} face. Maintain the person's facial features and identity from the original image.`,
    `Generate a new image of the person with a chic bob haircut flattering for a ${faceShape} face. Maintain the person's facial features and identity from the original image.`,
    `Generate a new image of the person with elegant, wavy shoulder-length hair perfect for a ${faceShape} face. Maintain the person's facial features and identity from the original image.`,
    `Generate a new image of the person with a trendy pixie cut that complements a ${faceShape} face. Maintain the person's facial features and identity from the original image.`
];

async function generateStyledImage(base64Data: string, prompt: string): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    const imagePart = fileToGenerativePart(base64Data, 'image/jpeg');

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [imagePart, { text: prompt }]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error('Image generation failed.');
}


export async function generateHairstyles(base64Data: string, faceShape: string): Promise<string[]> {
    const prompts = hairstylePrompts(faceShape);
    const promises = prompts.map(prompt => generateStyledImage(base64Data, prompt));
    return Promise.all(promises);
}

export async function generateOutfit(base64Data: string, palette: ColorPalette): Promise<string> {
    const prompt = `Redress the person in a stylish, modern outfit using the color palette named '${palette.name}' with these colors: ${palette.colors.join(', ')}. Maintain their facial features, identity, and hairstyle from the original image.`;
    return generateStyledImage(base64Data, prompt);
}