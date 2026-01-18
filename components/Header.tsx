
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

  return (
    <header style={{marginBottom: '40px'}}>
      <div className="border-heavy d-flex bg-white" style={{height: '130px', overflow: 'hidden'}}>
        <div className={`border-r d-flex items-center justify-center transition-all ${theme === 'classic' ? 'bg-white' : 'bg-red'}`} style={{width: '25%'}}>
            {theme === 'classic' ? (
               <div className="border-heavy justify-center items-center d-flex" style={{width: '60px', height: '60px', borderRadius: '50%', borderStyle: 'double'}}>
                  <span className="mondrian-title" style={{fontSize: '1.5rem'}}>G</span>
               </div>
            ) : (
               <span className="mondrian-title text-white" style={{fontSize: '10px', transform: 'rotate(-90deg)'}}>PRIMARY DISPATCH</span>
            )}
        </div>
        <div className="flex-grow d-flex flex-col">
            <div className="flex-grow d-flex items-center" style={{padding: '0 30px', position: 'relative'}}>
                <h1 className="mondrian-title" style={{fontSize: 'clamp(1.5rem, 5vw, 4rem)', letterSpacing: '-0.02em'}}>
                    THE {theme === 'classic' ? 'UNIVERSAL' : 'DE STIJL'} GAZETTE
                </h1>
                <div style={{position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '10px'}}>
                  <button onClick={onToggleTheme} style={{padding: '8px', borderRadius: '50%'}}>
                    {theme === 'mondrian' ? '🌙' : '☀️'}
                  </button>
                  <button onClick={onOpenSettings} style={{padding: '8px'}}>⚙️</button>
                </div>
            </div>
            <div className="border-t d-flex justify-between items-center bg-white" style={{padding: '8px 20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                <span>FEED: {subject.substring(0, 30)}...</span>
                <span className="hidden-mobile">{formattedDate}</span>
                <span>v.3.0</span>
            </div>
        </div>
        <div className={`border-l transition-all ${theme === 'classic' ? 'bg-white' : 'bg-blue'}`} style={{width: '60px'}}></div>
      </div>

      <div className="grid grid-cols-1 grid-md-3 border-heavy" style={{borderTop: 'none'}}>
        <div className="border-r" style={{gridColumn: 'span 2', padding: '24px'}}>
          <label style={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', display: 'block'}}>Subject Analysis</label>
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRefresh()}
            className="mondrian-title"
            style={{fontSize: '2rem', borderBottom: '2px solid #000'}}
            placeholder="DEFINE SUBJECT..."
          />
          <button
            onClick={onSuggestSources}
            disabled={isSuggestingSources || !subject}
            className="border-heavy transition-all"
            style={{marginTop: '20px', padding: '8px 16px', fontSize: '10px', fontWeight: '900', background: '#fff'}}
          >
            {isSuggestingSources ? 'CALIBRATING...' : 'SUGGEST REPOSITORIES'}
          </button>
        </div>

        <div className={`transition-all d-flex flex-col ${theme === 'classic' ? 'bg-white' : 'bg-yellow'}`} style={{padding: '24px'}}>
          <label style={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', display: 'block'}}>Wire Sources</label>
          <div className="custom-scrollbar" style={{maxHeight: '150px', overflowY: 'auto', marginBottom: '10px'}}>
            {sources.map((src, idx) => (
              <div key={idx} style={{display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center'}}>
                <input 
                  type="text" 
                  value={src}
                  onChange={(e) => updateSource(idx, e.target.value)}
                  style={{fontSize: '10px', fontWeight: '700', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', padding: '4px'}}
                />
                <button onClick={() => removeSource(idx)} style={{fontWeight: '900', color: 'red'}}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addSource} style={{fontSize: '9px', fontWeight: '900', border: '1px solid #000', padding: '4px'}}>+ ADD SOURCE</button>
        </div>
      </div>

      <div className="border-heavy d-flex bg-white" style={{borderTop: 'none', height: '60px'}}>
        <div className={`border-r ${theme === 'classic' ? 'bg-white' : 'bg-blue'}`} style={{width: '60px'}}></div>
        <button
          onClick={onRefresh}
          disabled={isLoading || !subject}
          className="flex-grow d-flex items-center justify-center transition-all btn-press"
          style={{border: 'none', height: '100%', padding: '0'}}
        >
          <span className="mondrian-title" style={{fontSize: '1.2rem', letterSpacing: '0.2em'}}>
            {isLoading ? 'WORKING...' : (articlesExist ? 'RE-TYPESET EDITION' : 'INITIATE PRESS CYCLE')}
          </span>
        </button>
        <div className={`border-l ${theme === 'classic' ? 'bg-white' : 'bg-red'}`} style={{width: '25%'}}></div>
      </div>
    </header>
  );
};

export default Header;
