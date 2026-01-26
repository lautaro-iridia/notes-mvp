import apiClient from './client';

export type NoteType = 'note' | 'thought' | 'idea';

export interface CategorySummary {
  id: string;
  name: string;
  color: string;
}

export interface LinkedNoteSummary {
  id: string;
  title: string;
  type: NoteType;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: NoteType;
  is_pinned: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
  categories: CategorySummary[];
  linked_notes: LinkedNoteSummary[];
}

export interface NoteCreate {
  title: string;
  content?: string;
  type?: NoteType;
  is_pinned?: boolean;
  color?: string;
  category_ids?: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  type?: NoteType;
  is_pinned?: boolean;
  color?: string;
  category_ids?: string[];
}

export interface NotesFilters {
  type?: NoteType;
  category_id?: string;
  search?: string;
  pinned_only?: boolean;
}

export interface NoteImport {
  id: string;
  title: string;
  content?: string;
  type?: NoteType;
  is_pinned?: boolean;
  color?: string;
  category_ids?: string[];
  linked_note_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CategoryImport {
  id: string;
  name: string;
  color: string;
}

export interface ImportRequest {
  notes: NoteImport[];
  categories?: CategoryImport[];
}

export interface ImportResponse {
  message: string;
  notes_imported: number;
  categories_imported: number;
}

export const notesApi = {
  async list(filters?: NotesFilters): Promise<Note[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.pinned_only) params.append('pinned_only', 'true');

    const response = await apiClient.get<Note[]>('/api/v1/notes', { params });
    return response.data;
  },

  async get(id: string): Promise<Note> {
    const response = await apiClient.get<Note>(`/api/v1/notes/${id}`);
    return response.data;
  },

  async create(data: NoteCreate): Promise<Note> {
    const response = await apiClient.post<Note>('/api/v1/notes', data);
    return response.data;
  },

  async update(id: string, data: NoteUpdate): Promise<Note> {
    const response = await apiClient.patch<Note>(`/api/v1/notes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/notes/${id}`);
  },

  async togglePin(id: string): Promise<Note> {
    const response = await apiClient.patch<Note>(`/api/v1/notes/${id}/pin`);
    return response.data;
  },

  async linkNotes(sourceId: string, targetId: string): Promise<void> {
    await apiClient.post(`/api/v1/notes/${sourceId}/links/${targetId}`);
  },

  async unlinkNotes(sourceId: string, targetId: string): Promise<void> {
    await apiClient.delete(`/api/v1/notes/${sourceId}/links/${targetId}`);
  },

  async importNotes(data: ImportRequest): Promise<ImportResponse> {
    const response = await apiClient.post<ImportResponse>('/api/v1/notes/import', data);
    return response.data;
  },
};

export default notesApi;
