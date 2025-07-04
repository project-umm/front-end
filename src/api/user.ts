import axiosInstance from './axios';
import { AxiosError } from 'axios';

export interface User {
  profile_url: string;
  nickname: string;
  username: string;
}

export interface UserProfileResponse {
  profile_url: string;
  nickname: string;
  username: string;
}

export interface UsersResponse {
  users: User[];
}

// 내 프로필 조회
export const getMyProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await axiosInstance.get<UserProfileResponse>('/api/users/my-profile');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};

// 다른 유저 프로필 조회
export const getUserProfile = async (nickname: string): Promise<UserProfileResponse> => {
  try {
    const response = await axiosInstance.get<UserProfileResponse>('/api/users/profile', {
      params: { nickname },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};
