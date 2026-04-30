import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { SERVER_URL } from 'store/constant';
import { toast } from 'react-toastify';
import useCustomizationStore from 'store/customizationStore';

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': true
  }
});

api.interceptors.request.use((config) => {
  const accessToken = Cookies.get('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 403) {
      toast.error("Sizning ushbu amaliyotni bajarish uchun huquqingiz yo'q");
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: unknown) => {
              originalRequest.headers!.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(SERVER_URL + '/auth/refresh-token', {}, { withCredentials: true });
        Cookies.set('accessToken', data.accessToken);

        api.defaults.headers.common.Authorization = 'Bearer ' + data.accessToken;

        processQueue(null, data.accessToken);

        return api(originalRequest);
      } catch (err) {
        console.log(error);
        failedQueue = [];

        Cookies.remove('accessToken');

        toast.error('Session expired. Please login again.');
        window.location.href = '/pages/login/login';
        useCustomizationStore.getState().logOut();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 400 && !Boolean(error.request.headers['hide-error'])) {
      // @ts-ignore
      toast.error(error.response?.data?.message || error.message || 'Xatolik kuzatildi');
    }

    return Promise.reject(error);
  }
);

export default api;
