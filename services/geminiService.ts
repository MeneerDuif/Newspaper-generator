
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle } from "../types";

export const fetchCustomNews = async (subject: string, sources: string[]): Promise<NewsArticle[]> => {
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
    4. Provide a relevant category.
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

    const articlesJson = JSON.parse(response.text || "[]");
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return articlesJson.map((article: any, index: number): NewsArticle => {
      let finalUrl = article.url;

      // Check if URL is suspicious or placeholder
      const isSuspicious = !finalUrl || 
                           finalUrl === "#" || 
                           finalUrl.includes("example.com") || 
                           !finalUrl.startsWith("http");

      if (isSuspicious && groundingChunks.length > 0) {
        // Attempt to find a matching URL from grounding metadata
        // We look for chunks that mention the source or have titles similar to the generated headline
        const wordsInTitle = article.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        
        const bestMatch = groundingChunks.find(chunk => {
          if (!chunk.web?.uri) return false;
          const chunkTitle = chunk.web.title?.toLowerCase() || "";
          const chunkUri = chunk.web.uri.toLowerCase();
          
          // Check if the chunk URL contains the source name
          const sourceMatch = article.source.toLowerCase().replace(/\s/g, '').includes(chunkUri.split('.')[1]) ||
                              chunkUri.includes(article.source.toLowerCase().replace(/\s/g, ''));
          
          // Check if any significant words from the title appear in the chunk title
          const titleMatch = wordsInTitle.some(word => chunkTitle.includes(word));
          
          return sourceMatch || titleMatch;
        });

        if (bestMatch?.web?.uri) {
          finalUrl = bestMatch.web.uri;
        } else if (groundingChunks[index]?.web?.uri) {
          // Fallback to the chunk at the same index if title matching fails
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
    console.error("Error in fetchCustomNews:", error);
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

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error suggesting sources:", error);
    return [];
  }
};
