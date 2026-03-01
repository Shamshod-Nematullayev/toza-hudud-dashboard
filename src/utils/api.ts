import axios from 'axios';
import Cookies from 'js-cookie';
import { SERVER_URL } from 'store/constant';
import { toast } from 'react-toastify';
const api = axios.create({
  baseURL: SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': true
  },
  withCredentials: true
});
// axios.defaults.baseURL = SERVER_URL;
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
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
      // try to refresh token
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        return axios
          .post(SERVER_URL + '/auth/refresh-token', { refreshToken })
          .then((response) => {
            Cookies.set('accessToken', response.data.accessToken);
            error.config.headers['Authorization'] = 'Bearer ' + response.data.accessToken;
            return api.request(error.config);
          })
          .catch((error) => {
            toast.error('Token refreshing failed');
            console.error(error);
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            window.location.href = '/pages/login/login';
            return Promise.reject(error);
          });
      } else {
        toast.error('Session has expired');
        console.log(error);
        Cookies.remove('accessToken');
        window.location.href = '/pages/login/login';
        return Promise.reject(error);
      }
    }
    if (error.response && error.response.status >= 400) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default api;
