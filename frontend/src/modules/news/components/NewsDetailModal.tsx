import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Article } from '../services/newsService';

interface NewsDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  isAuth: boolean; // Simula si el usuario está autenticado
}

export default function NewsDetailModal({ article, isOpen, onClose, isAuth }: NewsDetailModalProps) {
  const navigate = useNavigate();

  if (!isOpen || !article) return null;

  const handleSubscription = () => {
    if (isAuth) {
      // TODO: Implementar lógica de suscripción
      alert("¡Te has suscrito a nuestras noticias!");
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={28} />
        </button>
        <img className="w-full h-64 object-cover rounded-t-lg" src={article.imageUrl} alt={article.title} />
        <div className="p-8">
          <h2 className="text-3xl font-bold text-[#0e254d] mb-4">{article.title}</h2>
          <p className="text-gray-500 text-sm mb-6">
            Publicado el {new Date(article.publishDate).toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div 
            className="prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-bold text-lg mb-3">¡No te pierdas ninguna promoción!</h4>
            <button
              onClick={handleSubscription}
              className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              {isAuth ? 'Suscribirme a las noticias' : 'Iniciar sesión para suscribirme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

