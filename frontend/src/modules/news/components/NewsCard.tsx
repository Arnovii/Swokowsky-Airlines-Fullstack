import type { Article } from '../services/newsService';

interface NewsCardProps {
  article: Article;
  onReadMore: (article: Article) => void;
}

// Helper para formatear la fecha
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Helper para truncar el texto
const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export default function NewsCard({ article, onReadMore }: NewsCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <img className="h-48 w-full object-cover" src={article.imageUrl} alt={article.title} />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-bold text-xl mb-2 text-[#0e254d]">{article.title}</h3>
        <p className="text-gray-500 text-sm mb-4">{formatDate(article.publishDate)}</p>
        <p className="text-gray-700 text-base mb-4 flex-grow">
          {truncateText(article.summary, 140)}
        </p>
        <button 
          onClick={() => onReadMore(article)}
          className="mt-auto w-full bg-[#0e254d] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#0a1a3a] transition-colors"
        >
          Ver detalle
        </button>
      </div>
    </div>
  );
}