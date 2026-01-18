
import React from 'react';
import { NewsArticle } from '../types';

interface ArticleCardProps {
  article: NewsArticle;
  isMain?: boolean;
  isColorful?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isMain, isColorful }) => {
  // Assign a semi-random primary color if isColorful is true
  const colors = ['bg-mondrian-red', 'bg-mondrian-blue', 'bg-mondrian-yellow', 'bg-white'];
  const colorIndex = Math.floor(Math.random() * colors.length);
  const accentColor = isColorful ? colors[colorIndex] : 'bg-white';
  const textColor = accentColor === 'bg-mondrian-blue' || accentColor === 'bg-mondrian-red' ? 'text-white' : 'text-black';

  return (
    <article className="flex flex-col h-full mondrian-border group transition-transform hover:translate-x-1 hover:translate-y-1">
      {/* Meta Header */}
      <div className={`mondrian-border-b px-4 py-3 flex justify-between items-start ${isColorful ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">{article.category}</span>
          <span className={`text-[9px] font-bold uppercase opacity-80 ${isColorful ? 'text-mondrian-yellow' : 'text-black'}`}>
            {article.source}
          </span>
        </div>
        <span className="text-[10px] font-black">{article.date}</span>
      </div>

      {/* Content Block */}
      <div className={`p-6 flex-grow flex flex-col justify-center ${accentColor} ${textColor} transition-colors duration-500`}>
        <h2 className="mondrian-title text-2xl mb-4 leading-tight font-black tracking-tighter">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {article.title}
          </a>
        </h2>
        <div className={`w-12 h-1 mb-4 ${textColor === 'text-white' ? 'bg-white' : 'bg-black'} opacity-30`}></div>
        <p className="text-sm leading-relaxed font-bold opacity-90 italic">
          {article.summary}
        </p>
      </div>

      {/* Footer/Link Block */}
      <div className={`mondrian-border-t p-4 flex justify-between items-center bg-white`}>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest hover:text-mondrian-red transition-colors flex items-center gap-2"
        >
          READ FULL DISPATCH 
          <span className="text-lg">→</span>
        </a>
        <div className="w-6 h-6 mondrian-border bg-black"></div>
      </div>
    </article>
  );
};

export default ArticleCard;
