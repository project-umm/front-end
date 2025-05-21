import axiosInstance from './axios';

export interface UserProfile {
  profile_url: string;
}

export interface User {
  profile_url: string;
  nickname: string;
  username: string;
}

export const userApi = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/api/users/my-profile');
    return response.data;
  },

  // 다른 유저 프로필 조회
  getUserProfile: async (nickname: string): Promise<UserProfile> => {
    const response = await axiosInstance.get('/api/users/profile', {
      params: { nickname },
    });
    return response.data;
  },

  // 유저 목록 조회 (친구 추가용)
  getUsers: async (nickname?: string): Promise<{ users: User[] }> => {
    const response = await axiosInstance.get('/api/users', {
      params: { nickname },
    });
    return response.data;
  },
};
