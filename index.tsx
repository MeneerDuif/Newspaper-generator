import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  category: string;
  visualKeywords: string;
}

// --- AI Services ---
const extractJson = (text: string) => {
  try {
    const regex = /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```/;
    const match = text.match(regex);
    const jsonStr = match ? (match[1] || match[2]) : text;
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.warn("JSON Extraction fallback initiated.");
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }
    throw e;
  }
};

const fetchNews = async (subject: string, sources: string[]): Promise<NewsArticle[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const sourcePrompt = sources.length > 0 ? `Focus on: ${sources.join(", ")}.` : "Use academic and reliable science sources.";
  
  const prompt = `Act as a senior academic journalist. Research the latest insights in: "${subject}".
    ${sourcePrompt}
    Format as JSON array: [{title, summary, source, category, date, visualKeywords, url}].
    Use Google Search to ensure the 'url' is a real deep-link to the article.`;

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
            url: { type: Type.STRING }
          },
          required: ["title", "summary", "source", "category", "date", "url"]
        }
      }
    }
  });

  const data = extractJson(response.text || "[]");
  return data.map((item: any, i: number) => ({ ...item, id: `art-${i}-${Date.now()}` }));
};

// --- Components ---
const ArticleCard: React.FC<{ article: NewsArticle, isColorful: boolean }> = ({ article, isColorful }) => {
  const colors = ['bg-red', 'bg-blue', 'bg-yellow', 'bg-white'];
  const accent = isColorful ? colors[Math.floor(Math.random() * colors.length)] : 'bg-white';
  const isDark = accent === 'bg-blue' || accent === 'bg-red';

  return (
    <article className="border-heavy d-flex flex-col bg-white transition-all">
      <div className={`border-b d-flex justify-between items-center ${isColorful ? 'bg-black text-white' : 'bg-white'}`} style={{padding: '10px 15px', fontSize: '10px', fontWeight: '900'}}>
        <span>{article.category} • {article.source}</span>
        <span>{article.date}</span>
      </div>
      <div className={`flex-grow d-flex flex-col justify-center ${accent} ${isDark ? 'text-white' : 'text-black'}`} style={{padding: '30px'}}>
        <h2 className="gazette-title" style={{fontSize: '1.6rem', marginBottom: '15px'}}>{article.title}</h2>
        <div style={{width: '40px', height: '4px', background: 'currentColor', marginBottom: '15px', opacity: 0.3}}></div>
        <p style={{fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic', fontWeight: '600'}}>{article.summary}</p>
      </div>
      <div className="border-t d-flex justify-between items-center bg-white" style={{padding: '15px'}}>
        <a href={article.url} target="_blank" rel="noreferrer" style={{fontSize: '10px', fontWeight: '900'}}>READ FULL DISPATCH →</a>
        <div className="border-heavy bg-black" style={{width: '20px', height: '20px'}}></div>
      </div>
    </article>
  );
};

const SettingsMenu: React.FC<{ isOpen: boolean, onClose: () => void, theme: any, setTheme: any, isColorful: any, setIsColorful: any }> = (props) => {
  if (!props.isOpen) return null;
  return (
    <div className="settings-overlay">
      <div className="bg-white border-heavy" style={{width: '100%', maxWidth: '400px', padding: '40px'}}>
        <div className="d-flex justify-between items-center border-b" style={{marginBottom: '30px', paddingBottom: '10px'}}>
          <h2 className="gazette-title" style={{fontSize: '1.5rem'}}>Press Config</h2>
          <button onClick={props.onClose} style={{fontSize: '1.5rem', fontWeight: '900'}}>✕</button>
        </div>
        <div className="grid grid-cols-1" style={{gap: '20px'}}>
          <button onClick={() => props.setTheme('mondrian')} className="border-heavy" style={{padding: '15px', background: props.theme === 'mondrian' ? '#000' : '#fff', color: props.theme === 'mondrian' ? '#fff' : '#000'}}>MONDRIAN</button>
          <button onClick={() => props.setTheme('classic')} className="border-heavy" style={{padding: '15px', background: props.theme === 'classic' ? '#000' : '#fff', color: props.theme === 'classic' ? '#fff' : '#000'}}>CLASSIC</button>
          <button onClick={() => props.setIsColorful(!props.isColorful)} className="border-heavy" style={{padding: '15px', background: props.isColorful ? 'var(--mondrian-yellow)' : '#eee'}}>VIVID MODE: {props.isColorful ? 'ON' : 'OFF'}</button>
        </div>
        <button onClick={props.onClose} className="btn-press" style={{marginTop: '30px', padding: '15px'}}>DONE</button>
      </div>
    </div>
  );
};

// --- Main App ---
const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'mondrian' | 'classic'>('mondrian');
  const [isColorful, setIsColorful] = useState(true);
  const [subject, setSubject] = useState("Psychology and Philosophy insights");
  const [sources, setSources] = useState(["Psychology Today", "Scientific American", "Aeon", "Philosophy Now"]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchNews(subject, sources);
      setArticles(data);
    } catch (e) {
      alert("Error reaching the archives.");
    } finally {
      setIsLoading(false);
    }
  }, [subject, sources]);

  useEffect(() => { document.body.className = `theme-${theme}`; }, [theme]);
  useEffect(() => { load(); }, []);

  return (
    <div className="container transition-all">
      <header style={{marginBottom: '50px'}}>
        <div className="border-heavy d-flex bg-white" style={{height: '140px'}}>
          <div className={`border-r d-flex items-center justify-center ${theme === 'classic' ? 'bg-white' : 'bg-red'}`} style={{width: '20%'}}>
            <span className="gazette-title text-white" style={{fontSize: '12px', transform: 'rotate(-90deg)'}}>{theme === 'classic' ? '' : 'SPECIAL'}</span>
          </div>
          <div className="flex-grow d-flex flex-col">
            <div className="flex-grow d-flex items-center justify-between" style={{padding: '0 30px'}}>
              <h1 className="gazette-title" style={{fontSize: 'clamp(1.5rem, 6vw, 4.5rem)'}}>THE GAZETTE</h1>
              <button onClick={() => setIsSettingsOpen(true)} style={{fontSize: '24px'}}>⚙️</button>
            </div>
            <div className="border-t d-flex justify-between bg-white" style={{padding: '10px 30px', fontSize: '10px', fontWeight: '900'}}>
              <span>DISPATCH: {subject.toUpperCase()}</span>
              <span>EST. 2025</span>
            </div>
          </div>
          <div className={`border-l ${theme === 'classic' ? 'bg-white' : 'bg-blue'}`} style={{width: '60px'}}></div>
        </div>

        <div className="grid grid-cols-1 grid-md-3 border-heavy" style={{borderTop: 'none'}}>
          <div className="border-r flex-grow" style={{gridColumn: 'span 2', padding: '30px'}}>
            <label style={{fontSize: '10px', fontWeight: '900', display: 'block', marginBottom: '10px'}}>RESEARCH SUBJECT</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="gazette-title" style={{fontSize: '2rem', borderBottom: '2px solid #000'}} />
          </div>
          <div className={`${theme === 'classic' ? 'bg-white' : 'bg-yellow'}`} style={{padding: '30px'}}>
            <label style={{fontSize: '10px', fontWeight: '900', display: 'block', marginBottom: '10px'}}>SOURCES</label>
            <div className="custom-scrollbar" style={{maxHeight: '80px', overflowY: 'auto', fontSize: '10px', fontWeight: '700'}}>
               {sources.join(", ")}
            </div>
          </div>
        </div>

        <button onClick={load} disabled={isLoading} className="btn-press" style={{borderTop: 'none'}}>
          {isLoading ? 'INITIATING PRESS...' : 'REFRESH DISPATCH'}
        </button>
      </header>

      {isLoading ? (
        <div className="border-heavy d-flex items-center justify-center bg-white" style={{padding: '150px 0'}}>
           <div className="animate-pulse gazette-title" style={{fontSize: '3rem'}}>SYNTHESIZING...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-md-2 grid-lg-3">
          {articles.map(a => <ArticleCard key={a.id} article={a} isColorful={isColorful} />)}
        </div>
      )}

      <SettingsMenu 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        theme={theme} setTheme={setTheme} isColorful={isColorful} setIsColorful={setIsColorful}
      />
      
      <footer className="border-heavy d-flex bg-white" style={{marginTop: '100px', height: '100px', overflow: 'hidden'}}>
        <div className="bg-yellow border-r" style={{width: '30%', opacity: theme === 'classic' ? 0.2 : 1}}></div>
        <div className="flex-grow d-flex items-center justify-center">
          <div className="gazette-title" style={{fontSize: '1.2rem'}}>Universal Philosophy Feed</div>
        </div>
        <div className="bg-red border-l" style={{width: '60px'}}></div>
        <div className="bg-blue border-l" style={{width: '60px'}}></div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);