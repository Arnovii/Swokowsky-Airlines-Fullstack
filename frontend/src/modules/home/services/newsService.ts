// services/newsService.ts
import api from '../../../api/axios'; // Importa tu instancia de axios configurada

export interface CreateNewsData {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  featured?: boolean;
  status?: string;
  publishedAt?: string;
  imageFile?: File;
  [key: string]: any;
}

export class NewsService {
  // Obtener todas las noticias (con filtros)
  static async getNews(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    featured?: boolean;
    search?: string;
  }) {
    try {
      const response = await api.get('/news', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener noticias');
    }
  }

  // Obtener noticias destacadas para el home
  static async getFeaturedNews(limit = 6) {
    try {
      // Cambio la ruta para coincidir con tu endpoint
      const response = await api.get('/news', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener noticias destacadas');
    }
  }

  // Obtener una noticia por ID
  static async getNewsById(id: string) {
    try {
      const response = await api.get(`/news/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Noticia no encontrada');
      }
      throw new Error(error.response?.data?.message || 'Error al obtener la noticia');
    }
  }

  // Crear nueva noticia
  static async createNews(data: CreateNewsData) {
    try {
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

      const response = await api.post('/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear noticia');
    }
  }

  // Actualizar noticia
  static async updateNews(id: string, data: Partial<CreateNewsData>) {
    try {
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

      const response = await api.put(`/news/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar noticia');
    }
  }

  // Eliminar noticia
  static async deleteNews(id: string) {
    try {
      const response = await api.delete(`/news/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar noticia');
    }
  }

  // Obtener categorías
  static async getCategories() {
    try {
      const response = await api.get('/news/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener categorías');
    }
  }

  // Subir imagen
  static async uploadImage(file: File, type: 'news' | 'thumbnail' = 'news') {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await api.post('/upload/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir imagen');
    }
  }
}