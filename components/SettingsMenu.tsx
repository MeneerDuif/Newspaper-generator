
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 settings-overlay">
      <div className="bg-white mondrian-border w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h2 className="mondrian-title text-2xl">App Settings</h2>
          <button onClick={onClose} className="text-2xl font-black hover:text-mondrian-red transition-colors">✕</button>
        </div>

        <div className="space-y-8">
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest block mb-4">Visual Style</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('mondrian')}
                className={`p-4 mondrian-border transition-all ${theme === 'mondrian' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                <div className="mondrian-title text-sm">Mondrian</div>
                <div className="text-[8px] uppercase mt-1 opacity-60">Modernist Abstract</div>
              </button>
              <button 
                onClick={() => setTheme('classic')}
                className={`p-4 mondrian-border transition-all ${theme === 'classic' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                <div className="mondrian-title text-sm">Classic</div>
                <div className="text-[8px] uppercase mt-1 opacity-60">Traditional News</div>
              </button>
            </div>
          </section>

          <section>
            <label className="text-[10px] font-black uppercase tracking-widest block mb-4">Color Palette</label>
            <button 
              onClick={() => setIsColorful(!isColorful)}
              className={`w-full p-4 mondrian-border flex justify-between items-center transition-all ${isColorful ? 'bg-mondrian-yellow' : 'bg-gray-200'}`}
            >
              <span className="font-bold text-xs uppercase tracking-widest">
                {isColorful ? 'Vivid Highlights' : 'Grayscale Mode'}
              </span>
              <div className={`w-10 h-6 border-2 border-black rounded-full relative transition-colors ${isColorful ? 'bg-black' : 'bg-white'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full border border-black transition-all ${isColorful ? 'right-0.5 bg-mondrian-red' : 'left-0.5 bg-gray-400'}`} />
              </div>
            </button>
          </section>

          <section className="bg-gray-100 p-4 border-2 border-dashed border-gray-400">
            <label className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60">System Information</label>
            <p className="text-[9px] font-bold leading-relaxed text-gray-500">
              API Key is managed by the system environment. Your current session is grounded using Google Search real-time verification.
            </p>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="mt-10 w-full py-4 bg-black text-white mondrian-title text-sm hover:bg-mondrian-red transition-colors"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;
