import axios from 'axios';
import { setTokens } from './token';
import { AxiosError } from 'axios';
import axiosInstance from './axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// 리프레시 토큰 전용 axios 인스턴스
const refreshAxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginRequest {
  username: string;
  password: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

/**
 * 사용자 로그인 API
 * @param data 로그인 요청 데이터 (username, password)
 * @returns 토큰 정보 (access, refresh)
 */
export const login = async (data: LoginRequest) => {
  try {
    const response = await axiosInstance.post<TokenResponse>('/api/users/signin', data);
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    return response;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      return error.response;
    }
    throw error;
  }
};

/**
 * 토큰 갱신 API
 * @param refreshToken 갱신 토큰
 * @returns 새로운 토큰 정보 (access, refresh)
 */
export const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
  try {
    const response = await refreshAxiosInstance.post<TokenResponse>('/api/users/token/refresh', {
      refresh: refreshToken,
    });
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};
