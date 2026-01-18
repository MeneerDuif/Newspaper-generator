
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
  
  const [theme, setTheme] = useState<'mondrian' | 'classic'>(() => {
    return (localStorage.getItem('app-theme') as 'mondrian' | 'classic') || 'mondrian';
  });
  const [isColorful, setIsColorful] = useState<boolean>(() => {
    const saved = localStorage.getItem('app-colorful');
    return saved !== null ? saved === 'true' : true;
  });
  
  // Psychology & Philosophy Defaults
  const [subject, setSubject] = useState("latest insights in psychology and philosophy");
  const [sources, setSources] = useState([
    "Psychology Today", 
    "Scientific American", 
    "Aeon", 
    "Philosophy Now", 
    "Stanford Encyclopedia of Philosophy",
    "Mind & Language"
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
      setError("TRANSMISSION LOST. THE ACADEMIC WIRE IS DOWN.");
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
    <div className="container transition-all">
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
        <div className="border-heavy bg-red text-white container" style={{textAlign: 'center', marginTop: '40px', padding: '40px'}}>
          <p className="mondrian-title" style={{fontSize: '2rem', marginBottom: '20px'}}>{error}</p>
          <button 
            onClick={() => loadNews(false)}
            className="border-heavy bg-white text-black mondrian-title"
            style={{padding: '10px 30px', cursor: 'pointer'}}
          >
            RE-TYPESET FEED
          </button>
        </div>
      )}

      {isLoading && articles.length === 0 ? (
        <div className="border-heavy d-flex flex-col items-center justify-center bg-white" style={{padding: '100px 0', borderTop: 'none'}}>
          <div className="animate-pulse d-flex flex-col items-center">
            <div className="mondrian-title" style={{fontSize: '4rem', marginBottom: '20px'}}>SYNTHESIZING...</div>
            <div className="d-flex" style={{gap: '20px'}}>
                <div className="border-heavy bg-red" style={{width: '40px', height: '40px'}}></div>
                <div className="border-heavy bg-blue" style={{width: '40px', height: '40px'}}></div>
                <div className="border-heavy bg-yellow" style={{width: '40px', height: '40px'}}></div>
            </div>
          </div>
        </div>
      ) : articles.length === 0 && !isLoading ? (
        <div className="border-heavy bg-white" style={{padding: '80px', textAlign: 'center', borderTop: 'none'}}>
          <span className="mondrian-title">EDITION PENDING. DEFINE SUBJECT.</span>
        </div>
      ) : (
        <div style={{marginTop: '40px'}}>
          <div className="grid grid-cols-1 grid-md-2 grid-lg-3">
            {articles.map((article) => (
              <ArticleCard 
                key={article.id}
                article={article} 
                isColorful={isColorful} 
              />
            ))}
          </div>

          {articles.length > 0 && (
            <div style={{marginTop: '60px', textAlign: 'center'}}>
              <button
                onClick={() => loadNews(true)}
                disabled={isLoadingMore}
                className="btn-press"
                style={{maxWidth: '400px'}}
              >
                {isLoadingMore ? 'LOADING DISPATCHES...' : 'EXPAND COVERAGE'}
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="border-heavy d-flex bg-white" style={{height: '100px', marginTop: '80px', overflow: 'hidden'}}>
        <div className="bg-yellow border-r" style={{width: '33%', opacity: theme === 'classic' ? 0.2 : 1}}></div>
        <div className="flex-grow d-flex items-center justify-center">
           <div style={{textAlign: 'center'}}>
                <div className="mondrian-title" style={{fontSize: '1.2rem'}}>The Universal Dispatch</div>
                <div style={{fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.4, letterSpacing: '0.3em'}}>
                  {lastUpdated ? `LAST SYNC: ${lastUpdated.toLocaleTimeString()}` : 'AI-POWERED ANALYSIS'}
                </div>
           </div>
        </div>
        <div className="bg-red border-l" style={{width: '50px', opacity: 0.8}}></div>
        <div className="bg-blue border-l" style={{width: '50px', opacity: 0.8}}></div>
      </footer>
    </div>
  );
};

export default App;
