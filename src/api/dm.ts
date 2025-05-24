import axiosInstance from './axios';
import { AxiosError } from 'axios';

interface DmResponse {
  chats: DmChat[];
}

export interface DmChat {
  profile_url: string;
  nickname: string;
  chat_message: string;
  username: string;
  created_at: string;
}

interface DmListResponse {
  dms: DmList[];
}

export interface DmList {
  dm_id: string;
  profile_url: string;
  nickname: string;
  username: string;
  is_read: boolean;
}

// 대화 목록 조회
export const getDmList = async (): Promise<DmListResponse> => {
  try {
    const response = await axiosInstance.get<DmListResponse>('/api/dm');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};

// DM 대화 중 기존 대화 조회
export const getIndividualDm = async (dm_id: string): Promise<DmResponse> => {
  try {
    const response = await axiosInstance.get<DmResponse>(`/api/dm/${dm_id}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};

export const createDm = async (): Promise<{ dm_id: string }> => {
  try {
    const response = await axiosInstance.post<{ dm_id: string }>('/api/dm');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};
