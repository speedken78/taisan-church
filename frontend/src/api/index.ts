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
