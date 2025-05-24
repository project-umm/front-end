import React, { useState, useEffect } from 'react';
import { FriendButton } from './FriendButton';
import { AddFriendDialog } from './AddFriendDialog';
import { AlarmDialog } from './AlarmDialog';
import { getFriendRequests } from '@/api/friend';
import { DirectMessage } from './DirectMessage';
import { FriendsList } from './FriendsList';
import { useRouter } from 'next/router';

interface MainContentProps {
  alarmNumber?: number;
}

export const MainContent = ({ alarmNumber }: MainContentProps) => {
  const [notificationCount, setNotificationCount] = useState(alarmNumber || 0);
  const router = useRouter();
  const [status, setStatus] = useState('dm');

  useEffect(() => {
    if (router.query.menu === 'friends') {
      setStatus('friends');
    } else {
      setStatus('dm');
    }
  }, [router.query]);

  const fetchFriendRequests = async () => {
    try {
      const { ask_users } = await getFriendRequests();
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
      <div className="w-full h-[47px] border-b-2 border-umm-gray flex items-center gap-2 px-4 justify-between">
        <div className="flex items-center gap-2 justify-center">
          <FriendButton />
          <AddFriendDialog />
        </div>
        <div className="flex justify-center items-center relative">
          <AlarmDialog notificationCount={notificationCount} />
        </div>
      </div>
      <div className="w-full h-full flex">
        <div className="w-2/3 h-full border-r-2 border-umm-gray p-3">
          {status === 'friends' ? <FriendsList /> : <DirectMessage />}
        </div>
        <div className="w-1/3 h-full p-3">
          <b>현재 활동 중</b>
        </div>
      </div>
    </article>
  );
};
