import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const requirementAPI = {
  upload: (data) => api.post('/requirements/upload', data),
  list: (params) => api.get('/requirements', { params }),
  delete: (id) => api.delete(`/requirements/${id}`),
  classify: (text) => api.post('/requirements/classify', { text }),
};

export const traceabilityAPI = {
  link: (data) => api.post('/traceability/link', data),
  list: () => api.get('/traceability'),
  update: (id, data) => api.put(`/traceability/${id}`, data),
  delete: (id) => api.delete(`/traceability/${id}`),
};

export const testCaseAPI = {
  create: (data) => api.post('/testcases', data),
  list: (params) => api.get('/testcases', { params }),
  update: (id, data) => api.put(`/testcases/${id}`, data),
  delete: (id) => api.delete(`/testcases/${id}`),
};

export const kpiAPI = {
  get: () => api.get('/kpi'),
};

export const reportAPI = {
  srs: () => api.get('/reports/srs'),
  traceability: () => api.get('/reports/traceability'),
};

export default api;
