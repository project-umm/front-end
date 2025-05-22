import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from './token';
import { refreshToken } from './auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string> => {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    const { access } = await refreshToken(refreshTokenValue); // 여기서 실패 시 에러를 throw 해야 함
    setAccessToken(access);
    return access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      // 리프레시 시도 중이 아닐 때
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newAccessToken = await refreshAccessToken();
          isRefreshing = false;
          onRefreshed(newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          clearTokens();
          if (typeof window !== 'undefined') {
            alert('로그인 시간이 만료되었습니다. 다시 로그인 해주세요.');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      // 이미 리프레시 중이면 기다렸다가 재시도
      return new Promise(resolve => {
        refreshSubscribers.push((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    // 401 에러이면서 리프레시 토큰 요청이 실패한 경우
    if (error.response?.status === 401 && originalRequest?.url?.includes('token/refresh')) {
      clearTokens();
      if (typeof window !== 'undefined') {
        alert('로그인 시간이 만료되었습니다. 다시 로그인 해주세요.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 기타 에러 처리
    if (error.response) {
      const status = error.response.status;

      if (status === 401 && !originalRequest?.url?.includes('token/refresh')) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('접근 권한이 없습니다.');
      } else if (status === 404) {
        console.error('요청한 리소스를 찾을 수 없습니다.');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
