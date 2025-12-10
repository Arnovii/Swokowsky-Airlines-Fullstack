// src/modules/news/services/newsService.ts

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  isFeatured: boolean;
  publishDate?: string;
}

const mockArticles: Article[] = [
  {
    id: 1,
    title: '¡Madrid te espera con una oferta única!',
    summary: 'Vuela a la capital española a un precio increíble y vive la magia de sus calles, su arte y su gastronomía.',
    content: `
      <h2>Descubre Madrid como nunca antes</h2>
      <p>Recorre el Parque del Retiro, maravíllate en el Museo del Prado y disfruta de unas tapas con amigos en el Mercado de San Miguel. 
      Madrid es una ciudad que combina historia, modernidad y vida vibrante.</p>
      <p>Esta promoción es por tiempo limitado, ¡reserva ya y crea recuerdos inolvidables!</p>
    `,
    imageUrl: 'https://images.pexels.com/photos/3254729/pexels-photo-3254729.jpeg',
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Cartagena: sol, playa y un 30% de descuento',
    summary: 'Déjate seducir por el Caribe colombiano con esta promo especial. Historia, mar y fiesta te esperan.',
    content: `
      <h3>Cartagena, la joya del Caribe</h3>
      <p>Camina por las coloridas calles de la ciudad amurallada, relájate en las playas de Bocagrande y 
      vive noches inolvidables en su vibrante vida nocturna. </p>
      <p>Aprovecha nuestros descuentos exclusivos en vuelos y hoteles seleccionados. ¡Haz tu maleta ya!</p>
    `,
    imageUrl: 'https://images.pexels.com/photos/20184103/pexels-photo-20184103.jpeg',
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Aventura en la Amazonía: conecta con la naturaleza',
    summary: 'Embárcate en un viaje único por la selva amazónica con nuestros paquetes todo incluido.',
    content: `
      <p>Navega por el majestuoso río Amazonas, adéntrate en senderos llenos de vida salvaje 
      y descubre la biodiversidad más fascinante del planeta.</p>
      <p>Con guías expertos y experiencias seguras, este viaje será un antes y un después en tu vida. 
      ¡La Amazonía te está llamando!</p>
    `,
    imageUrl: 'https://images.pexels.com/photos/2739664/pexels-photo-2739664.jpeg',
    isFeatured: false,
  },
  {
    id: 4,
    title: 'Nuevas rutas en Colombia: ¡explora más!',
    summary: 'Llegamos a más rincones del país para que descubras su diversidad y belleza natural.',
    content: `
      <p>Ahora puedes volar con nosotros al Eje Cafetero, La Guajira y los Llanos Orientales. 
      Playas, montañas y llanuras, todo con la comodidad y servicio que nos caracteriza.</p>
      <p>Conecta con tu país de una forma única y redescubre la grandeza de Colombia.</p>
    `,
    imageUrl: 'https://images.pexels.com/photos/2884864/pexels-photo-2884864.jpeg',
    isFeatured: true,
  },
  {
    id: 5,
    title: 'Nueva York: la ciudad que nunca duerme te llama',
    summary: 'Cumple tu sueño de conocer la Gran Manzana con nuestras tarifas especiales desde Bogotá y Medellín.',
    content: `
      <h2>¡Vive el sueño neoyorquino!</h2>
      <p>Camina por Times Square, sube al Empire State y contempla la Estatua de la Libertad. 
      Nueva York es energía pura, diversidad y experiencias que no terminan.</p>
      <p>No dejes pasar esta oportunidad, ¡reserva ya tu vuelo a la ciudad que lo tiene todo!</p>
    `,
    imageUrl: 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg',
    isFeatured: false,
  },
];

const apiCall = <T>(data: T, delay = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), delay));

export const getAllArticles = (): Promise<Article[]> => {
  return apiCall(mockArticles);
};

export const getFeaturedArticles = (): Promise<Article[]> => {
  const featured = mockArticles.filter(article => article.isFeatured).slice(0, 3);
  return apiCall(featured);
};
