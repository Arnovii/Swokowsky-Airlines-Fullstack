export class NewsService {
  static BASE_URL = '/api/news';
  static UPLOAD_URL = '/api/upload';

  // Obtener todas las noticias (con filtros)
  static async getNews(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    featured?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.BASE_URL}?${queryParams}`);
    if (!response.ok) throw new Error('Error al obtener noticias');
    return await response.json();
  }

  // Obtener noticias destacadas para el home
  static async getFeaturedNews(limit = 6) {
    const response = await fetch(`${this.BASE_URL}/featured?limit=${limit}`);
    if (!response.ok) throw new Error('Error al obtener noticias destacadas');
    return await response.json();
  }

  // Obtener una noticia por ID
  static async getNewsById(id: string) {
    const response = await fetch(`${this.BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Noticia no encontrada');
    return await response.json();
  }

  // Crear nueva noticia
  static async createNews(data: CreateNewsData) {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'imageFile' && value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Agregar imagen si existe
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear noticia');
    }

    return await response.json();
  }

  // Actualizar noticia
  static async updateNews(id: string, data: Partial<CreateNewsData>) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'imageFile' && value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    const response = await fetch(`${this.BASE_URL}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) throw new Error('Error al actualizar noticia');
    return await response.json();
  }

  // Eliminar noticia
  static async deleteNews(id: string) {
    const response = await fetch(`${this.BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Error al eliminar noticia');
    return await response.json();
  }

  // Obtener categorías
  static async getCategories() {
    const response = await fetch(`${this.BASE_URL}/categories`);
    if (!response.ok) throw new Error('Error al obtener categorías');
    return await response.json();
  }

  // Subir imagen
  static async uploadImage(file: File, type: 'news' | 'thumbnail' = 'news') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const response = await fetch(`${this.UPLOAD_URL}/news`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Error al subir imagen');
    return await response.json();
  }
}
