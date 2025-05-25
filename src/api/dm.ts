import axiosInstance from './axios';
import { AxiosError } from 'axios';

interface DmResponse {
  chats: DmChat[];
  key: number;
  is_last: boolean;
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
    const response = await axiosInstance.get<DmListResponse>('/api/dms');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};

// DM 대화 중 기존 대화 조회
export const getIndividualDm = async (
  dm_id: string,
  key: number,
  page_number: number
): Promise<DmResponse> => {
  try {
    const response = await axiosInstance.get<DmResponse>(
      `/api/dms/${dm_id}?key=${key}&page_number=${page_number}`
    );
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
    const response = await axiosInstance.post<{ dm_id: string }>('/api/dms');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};
