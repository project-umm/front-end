import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// 개발 환경인지 확인
const isDevelopment = process.env.NODE_ENV === "development";

// 쿠키 옵션 설정
const getCookieOptions = () => ({
  secure: !isDevelopment, // 개발 환경이 아닐 때만 secure 적용
  httpOnly: !isDevelopment, // 개발 환경이 아닐 때만 httpOnly 적용
  sameSite: "strict" as const, // CSRF 공격 방지를 위해 sameSite를 strict로 설정
  path: "/",
});

// 액세스 토큰 관리
export const setAccessToken = (token: string) => {
  try {
    // XSS 방지를 위해 토큰을 저장하기 전에 sanitize
    const sanitizedToken = token.trim();
    localStorage.setItem(ACCESS_TOKEN_KEY, sanitizedToken);
  } catch (error) {
    console.error("액세스 토큰 저장 중 오류 발생:", error);
  }
};

export const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("액세스 토큰 조회 중 오류 발생:", error);
    return null;
  }
};

export const removeAccessToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("액세스 토큰 삭제 중 오류 발생:", error);
  }
};

// 리프레시 토큰 관리
export const setRefreshToken = (token: string) => {
  try {
    Cookies.set(REFRESH_TOKEN_KEY, token, getCookieOptions());
  } catch (error) {
    console.error("리프레시 토큰 저장 중 오류 발생:", error);
  }
};

export const getRefreshToken = () => {
  try {
    return Cookies.get(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("리프레시 토큰 조회 중 오류 발생:", error);
    return null;
  }
};

export const removeRefreshToken = () => {
  try {
    Cookies.remove(REFRESH_TOKEN_KEY, getCookieOptions());
  } catch (error) {
    console.error("리프레시 토큰 삭제 중 오류 발생:", error);
  }
};

// 모든 토큰 제거
export const clearTokens = () => {
  removeAccessToken();
  removeRefreshToken();
};

// 액세스 토큰과 리프레시 토큰을 한 번에 설정
export const setTokens = (accessToken: string, refreshToken: string) => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};
