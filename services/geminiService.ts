
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle } from "../types";

/**
 * Utility to extract JSON from a string that might contain markdown code blocks.
 */
const extractJson = (text: string) => {
  try {
    // Attempt to find content between ```json and ``` or just ``` and ```
    const regex = /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```/;
    const match = text.match(regex);
    const jsonStr = match ? (match[1] || match[2]) : text;
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error("JSON Extraction failed for text:", text);
    // Fallback: try to find the first [ and last ]
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }
    throw e;
  }
};

export const fetchCustomNews = async (subject: string, sources: string[]): Promise<NewsArticle[]> => {
  console.log(`Initiating news fetch for subject: ${subject}`);
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const sourceString = sources.length > 0 
      ? `You MUST search specifically for articles from these sources: ${sources.join(", ")}.` 
      : "Use a wide range of reputable publications relevant to the topic.";
    
    const prompt = `Research the latest news regarding: "${subject}". 
    ${sourceString}
    
    For each news story:
    1. Provide a professional newspaper-style headline.
    2. Provide a 2-3 sentence summary that synthesizes the key facts.
    3. Identify the specific source publication name.
    4. Provide a relevant category (e.g., COGNITIVE SCIENCE, ETHICS, NEUROSCIENCE).
    5. Provide the actual publication date.
    6. Provide 3 keywords for visual context.
    7. CRITICAL: You MUST provide the direct, valid external URL to the full article on the source's website. Use the Google Search tool to find the specific deep link to the story.

    FORMAT THE RESPONSE AS A VALID JSON ARRAY OF OBJECTS with keys: title, summary, source, category, date, visualKeywords, url.`;

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
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return articlesJson.map((article: any, index: number): NewsArticle => {
      let finalUrl = article.url;

      // Check if URL is suspicious or placeholder
      const isSuspicious = !finalUrl || 
                           finalUrl === "#" || 
                           finalUrl.includes("example.com") || 
                           !finalUrl.startsWith("http");

      if (isSuspicious && groundingChunks.length > 0) {
        const wordsInTitle = article.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        
        const bestMatch = groundingChunks.find(chunk => {
          if (!chunk.web?.uri) return false;
          const chunkTitle = chunk.web.title?.toLowerCase() || "";
          const chunkUri = chunk.web.uri.toLowerCase();
          
          const sourceMatch = article.source.toLowerCase().replace(/\s/g, '').includes(chunkUri.split('.')[1]) ||
                              chunkUri.includes(article.source.toLowerCase().replace(/\s/g, ''));
          
          const titleMatch = wordsInTitle.some(word => chunkTitle.includes(word));
          return sourceMatch || titleMatch;
        });

        if (bestMatch?.web?.uri) {
          finalUrl = bestMatch.web.uri;
        } else if (groundingChunks[index]?.web?.uri) {
          finalUrl = groundingChunks[index].web.uri;
        }
      }

      return {
        id: `art-${index}-${Date.now()}`,
        title: article.title,
        summary: article.summary,
        source: article.source,
        url: finalUrl,
        date: article.date,
        category: article.category,
        visualKeywords: article.visualKeywords
      };
    });
  } catch (error) {
    console.error("CRITICAL ERROR in fetchCustomNews:", error);
    throw error;
  }
};

export const suggestSourcesForSubject = async (subject: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Given the subject "${subject}", suggest 5-8 highly reputable and specific news sources or academic publications that would provide the best coverage. Return only a JSON array of strings.`;

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
    console.error("Error suggesting sources:", error);
    return [];
  }
};
