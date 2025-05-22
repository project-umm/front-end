import axiosInstance from './axios';
import { AxiosError } from 'axios';

export interface UserProfile {
  profile_url: string;
}

export interface User {
  profile_url: string;
  nickname: string;
  username: string;
}

export interface UserProfileResponse {
  profile: UserProfile;
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
      return error.response.data;
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
      return error.response.data;
    }
    throw error;
  }
};
