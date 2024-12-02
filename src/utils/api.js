import axios from 'axios';
import { SERVER_URL } from 'store/constant';
import { toast } from 'react-toastify';
const api = axios.create({
  baseURL: SERVER_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
// axios.defaults.baseURL = SERVER_URL;
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error('Session has expired');
      console.log(error);
      sessionStorage.removeItem('auth-token');
      window.location.href = '/startpage/pages/login/login3/';
      // handle unauthorized error
    }
    if (error.response && error.response.status >= 400) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default api;
