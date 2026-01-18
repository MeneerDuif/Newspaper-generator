
import React from 'react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'mondrian' | 'classic';
  setTheme: (t: 'mondrian' | 'classic') => void;
  isColorful: boolean;
  setIsColorful: (v: boolean) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  isOpen, 
  onClose, 
  theme, 
  setTheme, 
  isColorful, 
  setIsColorful 
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="bg-white border-heavy" style={{width: '100%', maxWidth: '450px', padding: '40px'}}>
        <div className="d-flex justify-between items-center border-b" style={{marginBottom: '30px', paddingBottom: '15px'}}>
          <h2 className="mondrian-title" style={{fontSize: '1.5rem'}}>Gazette Settings</h2>
          <button onClick={onClose} style={{fontSize: '2rem', fontWeight: '900'}}>✕</button>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
          <section>
            <label style={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px', display: 'block'}}>Editorial Style</label>
            <div className="grid grid-md-2" style={{gap: '15px'}}>
              <button 
                onClick={() => setTheme('mondrian')}
                className="border-heavy transition-all"
                style={{padding: '15px', background: theme === 'mondrian' ? '#000' : '#fff', color: theme === 'mondrian' ? '#fff' : '#000'}}
              >
                <div className="mondrian-title">Mondrian</div>
              </button>
              <button 
                onClick={() => setTheme('classic')}
                className="border-heavy transition-all"
                style={{padding: '15px', background: theme === 'classic' ? '#000' : '#fff', color: theme === 'classic' ? '#fff' : '#000'}}
              >
                <div className="mondrian-title">Classic</div>
              </button>
            </div>
          </section>

          <section>
            <button 
              onClick={() => setIsColorful(!isColorful)}
              className="border-heavy d-flex justify-between items-center transition-all"
              style={{width: '100%', padding: '15px', background: isColorful ? 'var(--mondrian-yellow)' : '#eee'}}
            >
              <span style={{fontWeight: '900', textTransform: 'uppercase', fontSize: '10px'}}>Vivid Highlights</span>
              <div className="border-heavy" style={{width: '40px', height: '20px', position: 'relative', background: '#fff'}}>
                <div style={{
                  position: 'absolute', top: '2px', bottom: '2px', width: '12px', background: '#000',
                  transition: '0.3s', left: isColorful ? '22px' : '2px'
                }}></div>
              </div>
            </button>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="btn-press"
          style={{marginTop: '40px', padding: '15px'}}
        >
          RETURN TO PRESS
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;
