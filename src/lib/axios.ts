import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { getAccessToken, clearTokens } from "./token";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

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
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 인증 오류 시 토큰 제거
          clearTokens();
          // TODO: 로그인 페이지로 리다이렉트 또는 토큰 갱신 로직 구현
          break;
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
