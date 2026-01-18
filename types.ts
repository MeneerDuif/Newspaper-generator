
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  category: string;
  visualKeywords: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}
