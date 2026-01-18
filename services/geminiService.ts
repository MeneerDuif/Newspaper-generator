
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle } from "../types";

const extractJson = (text: string) => {
  try {
    const regex = /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```/;
    const match = text.match(regex);
    const jsonStr = match ? (match[1] || match[2]) : text;
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error("JSON Extraction failed. Raw text:", text);
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (innerError) {
        throw innerError;
      }
    }
    throw e;
  }
};

export const fetchCustomNews = async (subject: string, sources: string[]): Promise<NewsArticle[]> => {
  console.log(`📡 Querying archives for: ${subject}`);
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const sourceString = sources.length > 0 
      ? `Prioritize these publications: ${sources.join(", ")}.` 
      : "Use reputable scientific and philosophical sources like Aeon, Scientific American, and Psychology Today.";
    
    const prompt = `You are a sophisticated science and philosophy journalist. 
    Report on the most fascinating recent findings, essays, or news regarding: "${subject}".
    
    ${sourceString}
    
    For each dispatch:
    1. Headline: Professional and engaging.
    2. Summary: 2-3 sentences of synthesized insight.
    3. Source: The publication name.
    4. Category: COGNITIVE, SOCIAL, ETHICS, METAPHYSICS, or NEUROSCIENCE.
    5. Date: Recent publication date.
    6. Keywords: 3 relevant keywords.
    7. URL: The absolute deep link to the source article. Use the Google Search tool to verify real links.

    OUTPUT: Valid JSON array of objects. Keys: title, summary, source, category, date, visualKeywords, url.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              category: { type: Type.STRING },
              date: { type: Type.STRING },
              visualKeywords: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ["title", "summary", "source", "category", "date", "visualKeywords", "url"]
          }
        }
      },
    });

    const articlesJson = extractJson(response.text || "[]");
    return articlesJson.map((article: any, index: number): NewsArticle => ({
      id: `psy-${index}-${Date.now()}`,
      ...article
    }));
  } catch (error) {
    console.error("News Fetch Failed:", error);
    throw error;
  }
};

export const suggestSourcesForSubject = async (subject: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Recommend 6 specific, world-class journals or news sites for "${subject}". Return as JSON array of strings.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return extractJson(response.text || "[]");
  } catch (error) {
    return ["Scientific American", "Psychology Today", "Aeon"];
  }
};
