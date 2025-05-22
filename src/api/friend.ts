import axiosInstance from './axios';
import { User } from './user';
import { AxiosError } from 'axios';
import { UsersResponse } from './user';

export interface FriendRequest {
  ask_id: number;
  profile_url: string;
  nickname: string;
  username: string;
}

export interface FriendRequestResponse {
  message: string;
}

export interface FriendRequestsResponse {
  ask_users: FriendRequest[];
}

export interface FriendsResponse {
  friends: User[];
}

/**
 * 친구 요청을 보내는 API
 * @param username 친구 요청할 사용자의 username
 * @returns 요청 결과 메시지
 */
export const requestFriend = async (username: string): Promise<FriendRequestResponse> => {
  try {
    const response = await axiosInstance.post<FriendRequestResponse>('/api/friends/ask', {
      username,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * 친구 신청 알림 목록을 조회하는 API
 * @returns 친구 요청 목록
 */
export const getFriendRequests = async (): Promise<FriendRequestsResponse> => {
  try {
    const response = await axiosInstance.get<FriendRequestsResponse>('/api/friends/alarms');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * 친구 요청을 수락하거나 거절하는 API
 * @param askId 친구 요청 ID
 * @param answer true: 수락, false: 거절
 */
export const answerFriendRequest = async (askId: number, answer: boolean): Promise<void> => {
  try {
    await axiosInstance.post('/api/friends/answer', { ask_id: askId, answer });
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * 내 친구 목록을 조회하는 API
 * @returns 친구 목록
 */
export const getFriends = async (): Promise<FriendsResponse> => {
  try {
    const response = await axiosInstance.get<FriendsResponse>('/api/friends');
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// 유저 목록 조회 (친구 추가용)
export const getUsers = async (nickname?: string): Promise<UsersResponse> => {
  try {
    const response = await axiosInstance.get<UsersResponse>('/api/friends/users', {
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
