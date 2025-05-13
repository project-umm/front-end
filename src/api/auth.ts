import axiosInstance from "./axios";
import { setTokens } from "./token";

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
export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await axiosInstance.post<TokenResponse>(
    "/api/users/signin",
    data
  );
  const { access, refresh } = response.data;
  setTokens(access, refresh);
  return response.data;
};

/**
 * 토큰 갱신 API
 * @param refreshToken 갱신 토큰
 * @returns 새로운 토큰 정보 (access, refresh)
 */
export const refreshToken = async (
  refreshToken: string
): Promise<TokenResponse> => {
  const response = await axiosInstance.post<TokenResponse>(
    "/api/users/token/refresh",
    {
      refresh: refreshToken,
    }
  );
  const { access, refresh } = response.data;
  setTokens(access, refresh);
  return response.data;
};
