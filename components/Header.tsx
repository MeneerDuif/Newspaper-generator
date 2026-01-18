
import React from 'react';

interface HeaderProps {
  onRefresh: () => void;
  onSuggestSources: () => Promise<void>;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  isLoading: boolean;
  isSuggestingSources: boolean;
  lastUpdated: Date | null;
  theme: 'mondrian' | 'classic';
  subject: string;
  setSubject: (val: string) => void;
  sources: string[];
  setSources: (val: string[]) => void;
  articlesExist: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onRefresh, 
  onSuggestSources,
  onOpenSettings,
  onToggleTheme,
  isLoading, 
  isSuggestingSources,
  lastUpdated, 
  theme,
  subject,
  setSubject,
  sources,
  setSources,
  articlesExist
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const addSource = () => setSources([...sources, '']);
  const updateSource = (index: number, val: string) => {
    const newSources = [...sources];
    newSources[index] = val;
    setSources(newSources);
  };
  const removeSource = (index: number) => setSources(sources.filter((_, i) => i !== index));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRefresh();
    }
  };

  return (
    <header className="mb-8">
      {/* Top Identity Row */}
      <div className="flex mondrian-border h-32 overflow-hidden bg-white">
        <div className={`w-1/4 ${theme === 'classic' ? 'bg-white' : 'bg-mondrian-red'} mondrian-border-r flex items-center justify-center transition-colors duration-500`}>
            {theme === 'classic' ? (
               <div className="w-16 h-16 border-4 border-double border-black rounded-full flex items-center justify-center">
                  <span className="font-serif italic text-3xl font-black">G</span>
               </div>
            ) : (
               <span className="mondrian-title text-white text-xs rotate-[-90deg]">PRIMARY BLOCK</span>
            )}
        </div>
        <div className="flex-grow flex flex-col">
            <div className="h-2/3 flex items-center px-8 relative">
                <h1 className="mondrian-title text-2xl md:text-5xl lg:text-6xl tracking-tighter transition-all">
                    THE {theme === 'classic' ? 'UNIVERSAL' : 'DE STIJL'} GAZETTE
                </h1>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    onClick={onToggleTheme}
                    className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
                    title="Toggle Theme"
                  >
                    {theme === 'mondrian' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={onOpenSettings}
                    className="w-10 h-10 flex items-center justify-center hover:rotate-45 transition-transform duration-300"
                    title="Settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
            </div>
            <div className={`h-1/3 mondrian-border-t flex justify-between items-center px-4 text-[10px] font-black uppercase tracking-widest ${theme === 'classic' ? 'bg-gray-100 italic' : 'bg-white'}`}>
                <span>INTELLIGENCE FEED: {subject.substring(0, 20)}...</span>
                <span className="hidden sm:inline">{formattedDate}</span>
                <span>EDITION v.2.5</span>
            </div>
        </div>
        <div className={`w-12 md:w-20 ${theme === 'classic' ? 'bg-gray-200' : 'bg-mondrian-blue'} mondrian-border-l transition-colors duration-500`}></div>
      </div>

      {/* Editorial Desk */}
      <div className={`grid grid-cols-1 md:grid-cols-3 mondrian-border mondrian-border-t-0 ${theme === 'classic' ? 'bg-[#fcfaf2]/50' : 'bg-white'}`}>
        <div className="col-span-2 mondrian-border-r p-6">
          <label className="text-[10px] font-black uppercase mb-2 block tracking-[0.2em]">Inquiry Vector</label>
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full mondrian-title text-xl md:text-3xl lg:text-4xl outline-none focus:text-mondrian-red transition-colors bg-transparent border-b-2 ${theme === 'classic' ? 'border-gray-300 italic' : 'border-black pb-2'}`}
            placeholder="DEFINE SUBJECT..."
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={onSuggestSources}
              disabled={isSuggestingSources || !subject}
              className={`mondrian-border px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-30 ${theme === 'classic' ? 'italic bg-white shadow-none' : 'bg-white'}`}
            >
              {isSuggestingSources ? 'CALIBRATING...' : 'SUGGEST REPOSITORIES'}
            </button>
          </div>
        </div>

        <div className={`p-6 ${theme === 'classic' ? 'bg-white' : 'bg-mondrian-yellow'} flex flex-col transition-colors duration-500`}>
          <label className="text-[10px] font-black uppercase mb-2 block tracking-[0.2em]">Source Matrix</label>
          <div className="space-y-2 flex-grow max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {sources.map((src, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={src}
                  onChange={(e) => updateSource(idx, e.target.value)}
                  className="flex-grow bg-white border border-black/10 px-2 py-1 text-[10px] font-bold outline-none focus:border-black"
                  placeholder="SOURCE NAME..."
                />
                <button onClick={() => removeSource(idx)} className="font-black text-xs hover:text-red-600 transition-colors">✕</button>
              </div>
            ))}
          </div>
          <button 
            onClick={addSource}
            className="mt-4 w-full text-[9px] font-black border-2 border-black bg-white py-1 hover:bg-black hover:text-white transition-all"
          >
            + ADD WIRE
          </button>
        </div>
      </div>

      {/* Execution Block */}
      <div className="mondrian-border mondrian-border-t-0 h-16 flex bg-white">
        <div className={`w-16 ${theme === 'classic' ? 'bg-white' : 'bg-mondrian-blue'} mondrian-border-r transition-colors`}></div>
        <button
          onClick={onRefresh}
          disabled={isLoading || !subject}
          className="flex-grow flex items-center justify-center group relative hover:bg-black transition-colors"
        >
          <span className={`mondrian-title text-xl tracking-[0.3em] transition-colors group-hover:text-white ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {articlesExist ? 'RE-TYPESET CURRENT FEED' : 'INITIATE PRESS CYCLE'}
          </span>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-black group-hover:border-white border-t-transparent rounded-full" />
              <span className="mondrian-title text-xs group-hover:text-white">PROCESSING DATA...</span>
            </div>
          )}
        </button>
        <div className={`w-1/4 ${theme === 'classic' ? 'bg-white border-l-2 border-double border-black' : 'bg-mondrian-red mondrian-border-l'} transition-colors`}></div>
      </div>
    </header>
  );
};

export default Header;
