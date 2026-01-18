
import React, { useState, useEffect, useCallback } from 'react';
import { fetchCustomNews, suggestSourcesForSubject } from './services/geminiService';
import { NewsArticle } from './types';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import SettingsMenu from './components/SettingsMenu';

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSuggestingSources, setIsSuggestingSources] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Theme state with local persistence
  const [theme, setTheme] = useState<'mondrian' | 'classic'>(() => {
    return (localStorage.getItem('app-theme') as 'mondrian' | 'classic') || 'mondrian';
  });
  const [isColorful, setIsColorful] = useState<boolean>(() => {
    const saved = localStorage.getItem('app-colorful');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [subject, setSubject] = useState("latest in psychology and philosophy");
  const [sources, setSources] = useState([
    "Psychology Today", 
    "Scientific American", 
    "Aeon", 
    "Philosophy Now", 
    "Stanford Encyclopedia of Philosophy"
  ]);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-colorful', String(isColorful));
  }, [isColorful]);

  const loadNews = useCallback(async (append = false) => {
    if (!subject) return;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    
    setError(null);
    try {
      const data = await fetchCustomNews(subject, sources.filter(s => s.trim()));
      
      if (append) {
        setArticles(prev => {
          const existingTitles = new Set(prev.map(a => a.title.toLowerCase()));
          const newArticles = data.filter(a => !existingTitles.has(a.title.toLowerCase()));
          return [...prev, ...newArticles];
        });
      } else {
        setArticles(data);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      setError("THE GRID HAS FAILED TO RESPOND. WIRE CONNECTION LOST.");
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [subject, sources]);

  const handleSuggestSources = useCallback(async () => {
    if (!subject) return;
    setIsSuggestingSources(true);
    try {
      const suggested = await suggestSourcesForSubject(subject);
      if (suggested.length > 0) {
        setSources(suggested);
      }
    } catch (err) {
      console.error("Failed to suggest sources", err);
    } finally {
      setIsSuggestingSources(false);
    }
  }, [subject]);

  const toggleTheme = () => setTheme(prev => prev === 'mondrian' ? 'classic' : 'mondrian');

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className={`max-w-[1400px] mx-auto p-4 md:p-10 transition-colors duration-500`}>
      <Header 
        onRefresh={() => loadNews(false)} 
        onSuggestSources={handleSuggestSources}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={toggleTheme}
        isLoading={isLoading} 
        isSuggestingSources={isSuggestingSources}
        lastUpdated={lastUpdated} 
        theme={theme}
        subject={subject}
        setSubject={setSubject}
        sources={sources}
        setSources={setSources}
        articlesExist={articles.length > 0}
      />

      <SettingsMenu 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        isColorful={isColorful}
        setIsColorful={setIsColorful}
      />

      {error && (
        <div className="mondrian-border bg-mondrian-red text-white p-8 my-10 text-center">
          <p className="mondrian-title text-3xl mb-4">{error}</p>
          <button 
            onClick={() => loadNews(false)}
            className="mondrian-border bg-white text-black px-6 py-2 mondrian-title text-sm hover:bg-black hover:text-white transition-colors"
          >
            RESTORE TRANSMISSION
          </button>
        </div>
      )}

      {isLoading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 mondrian-border border-t-0 bg-white/50">
          <div className="animate-pulse flex flex-col items-center text-center">
            <div className="mondrian-title text-6xl md:text-8xl mb-6">CURATING...</div>
            <div className="flex gap-4">
                <div className="w-8 h-8 bg-mondrian-red mondrian-border"></div>
                <div className="w-8 h-8 bg-mondrian-blue mondrian-border"></div>
                <div className="w-8 h-8 bg-mondrian-yellow mondrian-border"></div>
            </div>
          </div>
        </div>
      ) : articles.length === 0 && !isLoading ? (
        <div className="py-20 text-center mondrian-title text-xl mondrian-border bg-white/50">
          EDITION EMPTY. DEFINE SUBJECT TO BEGIN.
        </div>
      ) : (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard 
                key={article.id}
                article={article} 
                isColorful={isColorful} 
              />
            ))}
          </div>

          {articles.length > 0 && (
            <div className="mt-16 flex flex-col items-center">
              <button
                onClick={() => loadNews(true)}
                disabled={isLoadingMore}
                className="w-full md:w-auto mondrian-border bg-black text-white px-16 py-6 hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex flex-col items-center">
                  <span className="mondrian-title text-2xl tracking-[0.2em]">
                    {isLoadingMore ? 'AUGMENTING...' : 'EXPAND COVERAGE'}
                  </span>
                  <span className="text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">
                    Retrieve Further Dispatches
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="mt-20 flex mondrian-border h-24 overflow-hidden bg-white">
        <div className={`w-1/3 bg-mondrian-yellow mondrian-border-r hidden md:block ${theme === 'classic' ? 'opacity-20' : ''}`}></div>
        <div className="flex-grow flex items-center justify-center px-4">
           <div className="text-center">
                <div className="mondrian-title text-xl uppercase tracking-widest">
                  {theme === 'classic' ? 'The Universal Press' : 'De Stijl Newsroom'}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                  {lastUpdated ? `LAST SYNC: ${lastUpdated.toLocaleTimeString()}` : 'AI-GROUNDED VERIFICATION ENGINE'}
                </div>
           </div>
        </div>
        <div className="w-12 bg-mondrian-red mondrian-border-l opacity-80"></div>
        <div className="w-12 bg-mondrian-blue mondrian-border-l opacity-80"></div>
      </footer>
    </div>
  );
};

export default App;
