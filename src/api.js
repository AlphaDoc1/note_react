import axios from 'axios';

export const API_BASE = 'https://notes-backend-pfdf.onrender.com';

export const apiUrl = (path) => `${API_BASE}${path}`;

export const apiFetch = (path, options = {}) => {
  return fetch(apiUrl(path), options);
};

export const axiosApi = axios.create({ baseURL: API_BASE });


