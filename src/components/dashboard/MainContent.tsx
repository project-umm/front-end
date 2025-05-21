import React, { useState, useEffect } from 'react';
import { FriendButton } from './FriendButton';
import { AddFriendDialog } from './AddFriendDialog';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FriendRequest, getFriendRequests } from '@/api/friend';

export const MainContent = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  const fetchFriendRequests = async () => {
    try {
      const { ask_users } = await getFriendRequests();
      setFriendRequests(ask_users);
      setNotificationCount(ask_users.length);
    } catch (error) {
      console.error('알람 목록을 가져오는데 실패했습니다:', error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  return (
    <article className="w-full h-full rounded-r-lg flex-col flex" aria-label="대시보드 메인 콘텐츠">
      <div className="w-full h-[45px] border-b-2 border-umm-gray flex items-center gap-2 px-4 justify-between">
        <div className="flex items-center gap-2 justify-center">
          <FriendButton />
          <AddFriendDialog />
        </div>
        <div className="flex justify-center items-center relative">
          <Dialog>
            <DialogTrigger asChild>
              <button className="cursor-pointer">
                <FontAwesomeIcon icon={faBell} className="text-2xl" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <div className="min-h-[300px] flex flex-col">
                <DialogHeader>
                  <DialogTitle>알람</DialogTitle>
                </DialogHeader>
                <div className="flex-1 flex items-center justify-center">
                  {friendRequests.length === 0 ? (
                    <p className="text-gray-500">새로운 알람이 없습니다.</p>
                  ) : (
                    <div className="space-y-4"></div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {notificationCount > 0 && (
            <div className="absolute bottom-1 right-0 translate-x-1/2 translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-full flex">
        <div className="w-2/3 h-full border-r-2 border-umm-gray p-3">채팅창 자리</div>
        <div className="w-1/3 h-full p-3">
          <b>현재 활동 중</b>
        </div>
      </div>
    </article>
  );
};
