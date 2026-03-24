import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 自動帶入 JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 自動登出
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
};

export const newsApi = {
  getAll: () => api.get('/news/admin/all'),
  create: (data: FormData | object) => api.post('/news', data),
  update: (id: string, data: object) => api.put(`/news/${id}`, data),
  remove: (id: string) => api.delete(`/news/${id}`),
};

export const bannerApi = {
  getAll: () => api.get('/banners/admin/all'),
  create: (data: FormData) => api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: object) => api.put(`/banners/${id}`, data),
  remove: (id: string) => api.delete(`/banners/${id}`),
};

export const mediaApi = {
  getAll: () => api.get('/media/admin/all'),
  create: (data: object) => api.post('/media', data),
  update: (id: string, data: object) => api.put(`/media/${id}`, data),
  remove: (id: string) => api.delete(`/media/${id}`),
};

export const pastorWorkApi = {
  getAll: () => api.get('/pastor-works/admin/all'),
  create: (data: FormData) => api.post('/pastor-works', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: object) => api.put(`/pastor-works/${id}`, data),
  remove: (id: string) => api.delete(`/pastor-works/${id}`),
};

export const groupApi = {
  getAll: () => api.get('/groups/admin/all'),
  create: (data: FormData) => api.post('/groups', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: object) => api.put(`/groups/${id}`, data),
  remove: (id: string) => api.delete(`/groups/${id}`),
};

export const formApi = {
  getAll: () => api.get('/forms/admin/all'),
  getById: (id: string) => api.get(`/forms/${id}`),
  create: (data: object) => api.post('/forms', data),
  update: (id: string, data: object) => api.put(`/forms/${id}`, data),
  remove: (id: string) => api.delete(`/forms/${id}`),
  getSubmissions: (id: string, page = 1) => api.get(`/forms/${id}/submissions?page=${page}`),
};

export const resourceCategoryApi = {
  getAll: () => api.get('/resource-categories'),
  create: (data: { name: string; order: number }) => api.post('/resource-categories', data),
  update: (id: string, data: { name?: string; order?: number }) => api.put(`/resource-categories/${id}`, data),
  remove: (id: string) => api.delete(`/resource-categories/${id}`),
};

export const resourceApi = {
  getAll: () => api.get('/resources/admin/all'),
  create: (data: FormData) =>
    api.post('/resources', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: object) => api.put(`/resources/${id}`, data),
  remove: (id: string) => api.delete(`/resources/${id}`),
};

export const offeringApi = {
  getRecords: (page = 1) => api.get(`/offering/admin/records?page=${page}`),
};

export default api;
