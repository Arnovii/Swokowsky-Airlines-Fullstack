export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string; // Contenido en formato HTML
  imageUrl: string;
  publishDate: string; // Formato ISO 8601
  isFeatured: boolean;
}

// Datos de ejemplo que simulan venir de tu backend
const mockArticles: Article[] = [
  {
    id: 1,
    title: '¡Oferta Imperdible! Vuela a Madrid por menos de lo que imaginas',
    summary: 'Descubre la capital española con nuestros precios especiales. ¡Reserva ahora y vive una experiencia inolvidable!',
    content: '<h2>Descubre Madrid como nunca antes</h2><p>Hemos preparado una oferta especial para que viajes a Madrid, una ciudad vibrante llena de cultura, arte y gastronomía. Pasea por el Parque del Retiro, visita el Museo del Prado y disfruta de unas tapas en el Mercado de San Miguel.</p><p>Esta promoción es por tiempo limitado. No dejes pasar la oportunidad de crear recuerdos inolvidables.</p>',
    imageUrl: 'https://placehold.co/800x400/0e254d/ffffff?text=Madrid',
    publishDate: '2025-09-20T12:00:00Z',
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Promoción a Cartagena: Sol, playa y historia',
    summary: 'El caribe te espera. Vuela a Cartagena con descuentos de hasta el 30%. ¡No te quedes por fuera!',
    content: '<h3>Cartagena, la joya del Caribe</h3><p>Sumérgete en la historia de la ciudad amurallada, relájate en las playas de Bocagrande y disfruta de la increíble vida nocturna. Nuestra promoción incluye tarifas especiales en vuelos y hoteles seleccionados.</p>',
    imageUrl: 'https://placehold.co/800x400/f0ad4e/ffffff?text=Cartagena',
    publishDate: '2025-09-18T10:00:00Z',
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Aventura en la Amazonía: Conecta con la naturaleza',
    summary: 'Explora la selva amazónica con nuestros paquetes todo incluido. Una experiencia única para los amantes de la aventura.',
    content: '<p>Navega por el río Amazonas, camina por la selva y descubre la increíble biodiversidad de la región. Nuestros guías expertos te acompañarán en esta aventura segura y emocionante.</p>',
    imageUrl: 'https://placehold.co/800x400/5cb85c/ffffff?text=Amazonas',
    publishDate: '2025-09-15T09:00:00Z',
    isFeatured: false,
  },
  {
    id: 4,
    title: 'Nuevas rutas nacionales: ¡Descubre Colombia!',
    summary: 'Ampliamos nuestras rutas para que puedas conocer más rincones de nuestro hermoso país. Compra tus tiquetes ya.',
    content: '<p>Ahora puedes volar a destinos como el Eje Cafetero, La Guajira y los Llanos Orientales con la comodidad y el servicio que nos caracteriza.</p>',
    imageUrl: 'https://placehold.co/800x400/d9534f/ffffff?text=Colombia',
    publishDate: '2025-09-12T15:00:00Z',
    isFeatured: true,
  },
    {
    id: 5,
    title: 'Viaja a Nueva York: La ciudad que nunca duerme',
    summary: 'Cumple tu sueño de conocer la Gran Manzana con tarifas especiales saliendo desde Bogotá y Medellín.',
    content: '<h2>¡Nueva York te espera!</h2><p>Desde Times Square hasta la Estatua de la Libertad, Nueva York ofrece un sinfín de atracciones. Aprovecha nuestros precios de temporada y vuela con nosotros.</p>',
    imageUrl: 'https://placehold.co/800x400/337ab7/ffffff?text=New+York',
    publishDate: '2025-09-10T11:00:00Z',
    isFeatured: false,
  },
];

// Simula una llamada a la API con un retraso para mostrar el estado de "cargando"
const apiCall = <T>(data: T, delay = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), delay));

// Función para obtener todos los artículos
export const getAllArticles = (): Promise<Article[]> => {
  return apiCall(mockArticles);
};

// Función para obtener los artículos destacados (máximo 3 para el carrusel)
export const getFeaturedArticles = (): Promise<Article[]> => {
  const featured = mockArticles.filter(article => article.isFeatured).slice(0, 3);
  return apiCall(featured);
};
