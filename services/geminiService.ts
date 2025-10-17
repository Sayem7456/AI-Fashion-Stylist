
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
  
  const prompt = "Analyze the person in this image. Identify their gender (e.g., Male, Female), their face shape from one of the following options: Oval, Round, Square, Heart, Diamond, or Long. Also, based on their skin tone, suggest 3 complementary clothing color palettes. Each palette should have a creative name (e.g., 'Earthy Warmth') and an array of 4 hex color codes. Return the response as a single JSON object.";
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      faceShape: { type: Type.STRING },
      gender: { type: Type.STRING },
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
    required: ['faceShape', 'gender', 'colorPalettes'],
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

// Agent 1: Fashion Assistant - Describes flattering hairstyles.
async function getHairstyleDescription(faceShape: string, gender: string): Promise<string> {
  const model = 'gemini-2.5-flash';
  const prompt = `You are an expert fashion and hairstyle assistant. For a ${gender} client with a ${faceShape} face shape, provide a detailed description of four distinct and flattering hairstyles. Ensure variety in length (e.g., short, medium, long) and style (e.g., straight, wavy, an updo). Your descriptions should be inspiring and detailed enough for a creative director to envision.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

// Agent 2: Prompt Engineer - Creates image generation prompts from descriptions.
async function createPromptsFromDescription(description: string, base64Data: string): Promise<string[]> {
    const model = 'gemini-2.5-flash';
    const imagePart = fileToGenerativePart(base64Data, 'image/jpeg');
    
    const prompt = `You are a world-class creative director specializing in photorealistic AI image generation. Your task is to transform hairstyle descriptions into master-level prompts for an image generation model.

Based on the following hairstyle descriptions: "${description}", create exactly four distinct and highly detailed prompts.

For each prompt, follow these rules:
1.  **Reference the Person:** Start by stating the goal is to modify the person from the provided photo.
2.  **Detailed Hairstyle:** Elaborate on the given hairstyle description. Include details about texture (e.g., silky, tousled, defined curls), volume, parting, and how the hair frames the face. Mention lighting effects on the hair like 'subtle highlights' or 'a healthy sheen'.
3.  **Photorealism:** Use keywords that encourage a photorealistic result, such as 'ultra-realistic photo', 'sharp focus', 'soft natural lighting', '8k'.
4.  **Unalterable Identity:** This is the MOST IMPORTANT rule. The generated image MUST perfectly preserve the identity of the person in the original photo. This includes their exact facial features, skin tone, expression, age, and **gender**. The prompt must contain a non-negotiable instruction to this effect. Any change to the person's identity is a complete failure.
5.  **Negative Prompt:** Add a 'Negative Prompt' section to each prompt. This should list things to avoid, like 'gender swap, changing gender, different person, blurry, deformed, mutated, extra limbs, unrealistic, cartoonish, disfigured, mismatched lighting, unnatural hairline'.

Return the response as a single JSON object with a key "prompts" which is an array of 4 strings.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        },
        required: ['prompts']
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
    const result = JSON.parse(jsonString) as { prompts: string[] };
    if (result.prompts.length !== 4) {
      throw new Error("Prompt generation agent did not return 4 prompts.");
    }
    return result.prompts;
}


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


export async function generateHairstyles(base64Data: string, faceShape: string, gender: string): Promise<string[]> {
    // Agent 1: Get hairstyle ideas from the Fashion Assistant
    const description = await getHairstyleDescription(faceShape, gender);
    
    // Agent 2: Create specific prompts from the ideas via the Prompt Engineer
    const prompts = await createPromptsFromDescription(description, base64Data);

    // Generate images from the dynamic prompts
    const promises = prompts.map(prompt => generateStyledImage(base64Data, prompt));
    return Promise.all(promises);
}

export async function generateOutfit(base64Data: string, palette: ColorPalette, gender: string): Promise<string> {
    const prompt = `Generate an ultra-realistic photo of the person from the original image, but redressed in a stylish, modern outfit for a ${gender}.

**Outfit Details:**
- The outfit should be inspired by the color palette named '${palette.name}' using these specific colors: ${palette.colors.join(', ')}.
- The style should be contemporary and fashionable.

**Crucial Instructions:**
- **Unalterable Identity:** This is the MOST IMPORTANT rule. You MUST perfectly preserve the identity of the person from the original photo. Maintain their exact facial features, gender, age, identity, body shape, and the hairstyle from the original image. Do not alter the person in any way other than their clothing.

**Realism:**
- The image should have soft, natural lighting, sharp focus, and look like a real photograph.

**Negative Prompt:** Avoid gender swap, changing gender, different person, blurry, deformed, mutated, unrealistic textures, cartoonish styles, mismatched lighting, or any changes to the person's face and hair.`;
    return generateStyledImage(base64Data, prompt);
}