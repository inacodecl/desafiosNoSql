import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: BASE_URL });

// ── Interceptor: agrega token automáticamente ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor: manejo de errores global ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ════════════════════════════════════════
// AUTH
// ════════════════════════════════════════
export const authAPI = {
  login: (correo) => api.post('/auth/login', { correo }),
};

// ════════════════════════════════════════
// DOCENTES  (admin)
// ════════════════════════════════════════
export const docentesAPI = {
  listar:     (params) => api.get('/docentes', { params }),
  obtener:    (uid)    => api.get(`/docentes/${uid}`),
  crear:      (data)   => api.post('/docentes', data),
  actualizar: (uid, data) => api.put(`/docentes/${uid}`, data),
  eliminar:   (uid)    => api.delete(`/docentes/${uid}`),
  dashboard:  ()       => api.get('/docentes/dashboard'),
};

// ════════════════════════════════════════
// USUARIOS / ALUMNOS  (docente)
// ════════════════════════════════════════
export const usuariosAPI = {
  listar:     (params) => api.get('/usuarios', { params }),
  obtener:    (uid)    => api.get(`/usuarios/${uid}`),
  crear:      (data)   => api.post('/usuarios', data),
  desactivar: (uid)    => api.delete(`/usuarios/${uid}`),
};

// ════════════════════════════════════════
// DESAFÍOS
// ════════════════════════════════════════
export const desafiosAPI = {
  listar:     (params) => api.get('/desafios', { params }),
  obtener:    (uid)    => api.get(`/desafios/${uid}`),
  crear:      (data)   => api.post('/desafios', data),
  actualizar: (uid, data) => api.put(`/desafios/${uid}`, data),
};

// ════════════════════════════════════════
// PROGRESO
// ════════════════════════════════════════
export const progresoAPI = {
  enviarIntento:        (data)  => api.post('/progreso', data),
  miProgreso:           ()      => api.get('/progreso/mio'),
  todos:                (params)=> api.get('/progreso', { params }),
  porEstudiante:        (uid)   => api.get(`/progreso/${uid}`),
};

// ════════════════════════════════════════
// RANKING
// ════════════════════════════════════════
export const rankingAPI = {
  porDesafio: (uid)    => api.get(`/ranking/${uid}`),
  todos:      (params) => api.get('/ranking', { params }),
};

// ════════════════════════════════════════
// MEDALLAS
// ════════════════════════════════════════
export const medallasAPI = {
  porEstudiante: (uid) => api.get(`/medallas/${uid}`),
};

export default api;