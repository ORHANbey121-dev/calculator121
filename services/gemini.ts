
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Language } from "../types";
import { translations } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getMathExplanation = async (problem: string, language: Language, imageBase64?: string): Promise<AIResponse> => {
  try {
    const parts: any[] = [];
    const t = translations[language];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64.split(',')[1],
        },
      });
      parts.push({
        text: `Recognize the math problem in this image and explain it step-by-step. ${problem ? `Note: ${problem}` : ''}. ${t.promptSuffix}`,
      });
    } else {
      parts.push({
        text: `Explain this math problem step-by-step: "${problem}". ${t.promptSuffix}`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "Brief summary of the problem.",
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Steps to solve the problem.",
            },
            solution: {
              type: Type.STRING,
              description: "The final answer.",
            },
          },
          required: ["explanation", "steps", "solution"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(translations[language].errorAi);
  }
};
