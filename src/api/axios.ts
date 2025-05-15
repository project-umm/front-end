import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "./token";
import { refreshToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// 토큰 리프레시 중인지 확인하는 플래그
let isRefreshing = false;
// 리프레시 중일 때 대기할 요청들을 저장하는 배열
let refreshSubscribers: ((token: string) => void)[] = [];

// 리프레시 완료 후 대기 중인 요청들을 실행
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// 리프레시 토큰으로 새로운 액세스 토큰을 발급받는 함수
const refreshAccessToken = async () => {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error("리프레시 토큰이 없습니다.");
    }

    const { access } = await refreshToken(refreshTokenValue);
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
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();
          isRefreshing = false;
          onRefreshed(newAccessToken);

          // 실패했던 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          clearTokens();
          // TODO: 로그인 페이지로 리다이렉트
          return Promise.reject(refreshError);
        }
      } else {
        // 이미 리프레시 중이면 새로운 토큰을 기다림
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 403:
          // 권한 오류 처리
          break;
        case 404:
          // 리소스를 찾을 수 없는 경우
          break;
        default:
          // 기타 오류 처리
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
