import apiClient from './client';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

export interface CategoryCreate {
  name: string;
  color: string;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
}

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/api/v1/categories');
    return response.data;
  },

  async get(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/v1/categories/${id}`);
    return response.data;
  },

  async create(data: CategoryCreate): Promise<Category> {
    const response = await apiClient.post<Category>('/api/v1/categories', data);
    return response.data;
  },

  async update(id: string, data: CategoryUpdate): Promise<Category> {
    const response = await apiClient.patch<Category>(`/api/v1/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/categories/${id}`);
  },
};

export default categoriesApi;
