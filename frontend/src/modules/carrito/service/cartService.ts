import api from '../../../api/axios';

// Tipos para los items del carrito según la respuesta de tu backend
export interface CartItem {
  id_item_carrito: number;
  id_vueloFK: number;
  cantidad_de_tickets: number;
  clase: 'economica' | 'primera_clase';
  fecha_limite: string;
  vuelo: any; // Puedes tipar esto mejor si tienes el tipo de vuelo
}

export interface CartResponse {
  id_carrito: number;
  items: CartItem[];
}

export interface AddCartItemDto {
  id_vueloFK: number;
  cantidad_de_tickets: number;
  clase: 'economica' | 'primera_clase';
}

const cartService = {
  async getCart(): Promise<CartResponse> {
    const { data } = await api.get('/cart');
    return data;
  },
  async addItem(item: AddCartItemDto): Promise<any> {
    const { data } = await api.post('/cart/items', item);
    return data;
  },
  async updateItem(id: number, cantidad_de_tickets: number): Promise<any> {
    const { data } = await api.patch(`/cart/items/${id}`, { cantidad_de_tickets });
    return data;
  },
  async removeItem(id: number): Promise<any> {
    const { data } = await api.delete(`/cart/items/${id}`);
    return data;
  },
};


export default cartService;
