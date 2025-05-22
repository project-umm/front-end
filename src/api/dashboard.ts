import axiosInstance from './axios';
import { AxiosError } from 'axios';

export interface DmUser {
  profile_url: string;
  nickname: string;
  username: string;
}

export interface MyProfile {
  profile_url: string;
  nickname: string;
  username: string;
}

export interface DashboardResponse {
  alarm_number: number;
  dm_users: DmUser[];
  my_profile: MyProfile;
}

/**
 * 대시보드 초기 화면 로딩 API
 * @returns 대시보드 정보 (알림 수, DM 유저 목록, 내 프로필)
 */
export const getDashboard = async (): Promise<DashboardResponse> => {
  try {
    const response = await axiosInstance.get<DashboardResponse>('/api/main/dashboard');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};
