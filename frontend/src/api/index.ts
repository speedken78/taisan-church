import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const newsApi = {
  getAll: () => api.get('/news'),
  getById: (id: string) => api.get(`/news/${id}`),
};

export const bannerApi = {
  getActive: () => api.get('/banners'),
};

export const mediaApi = {
  getByCategory: (category: 'sunday' | 'children' | 'equip') =>
    api.get(`/media/category/${category}`),
};

export const pastorWorkApi = {
  getAll: () => api.get('/pastor-works'),
};

export const groupApi = {
  getAll: () => api.get('/groups'),
};

export const formApi = {
  getOpen: (type?: string) => api.get('/forms', { params: type ? { type } : {} }),
  getById: (id: string) => api.get(`/forms/${id}`),
  submit: (id: string, data: {
    name: string;
    email: string;
    phone: string;
    answers: Record<string, string | string[]>;
    quantity: number;
  }) => api.post(`/forms/${id}/submit`, data),
};

export const offeringApi = {
  create: (data: {
    amount: number;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    purpose?: string;
  }) => api.post('/offering/create', data),
};

export default api;
