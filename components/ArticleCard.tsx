
import React from 'react';
import { NewsArticle } from '../types';

interface ArticleCardProps {
  article: NewsArticle;
  isColorful?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isColorful }) => {
  const colors = ['bg-red', 'bg-blue', 'bg-yellow', 'bg-white'];
  const colorIndex = Math.floor(Math.random() * colors.length);
  const accentColor = isColorful ? colors[colorIndex] : 'bg-white';
  const textColor = accentColor === 'bg-blue' || accentColor === 'bg-red' ? 'text-white' : 'text-black';

  return (
    <article className="border-heavy d-flex flex-col bg-white transition-all" style={{height: '100%'}}>
      <div className={`border-b d-flex justify-between items-center ${isColorful ? 'bg-black text-white' : 'bg-white text-black'}`} style={{padding: '10px 16px'}}>
        <div className="d-flex flex-col">
          <span style={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em'}}>{article.category}</span>
          <span style={{fontSize: '8px', fontWeight: '700', opacity: 0.7}}>{article.source}</span>
        </div>
        <span style={{fontSize: '9px', fontWeight: '900'}}>{article.date}</span>
      </div>

      <div className={`flex-grow d-flex flex-col justify-center ${accentColor} ${textColor}`} style={{padding: '24px'}}>
        <h2 className="mondrian-title" style={{fontSize: '1.5rem', marginBottom: '16px'}}>
          <a href={article.url} target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}>
            {article.title}
          </a>
        </h2>
        <div style={{width: '40px', height: '4px', background: textColor === 'text-white' ? '#fff' : '#000', marginBottom: '16px', opacity: 0.3}}></div>
        <p style={{fontSize: '14px', lineHeight: '1.6', fontWeight: '600', fontStyle: 'italic'}}>
          {article.summary}
        </p>
      </div>

      <div className="border-t d-flex justify-between items-center bg-white" style={{padding: '16px'}}>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#000', textDecoration: 'none'}}
        >
          READ FULL DISPATCH →
        </a>
        <div className="border-heavy bg-black" style={{width: '20px', height: '20px'}}></div>
      </div>
    </article>
  );
};

export default ArticleCard;
