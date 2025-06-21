import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { FriendButton } from './FriendButton';
import { AddFriendDialog } from './AddFriendDialog';
import { AlarmDialog } from './AlarmDialog';
import { getFriendRequests } from '@/api/friend';
import { FriendsList } from './FriendsList';
import { DirectMessage } from './direct-message/DirectMessage';
import { useRouter } from 'next/router';
import { User } from '@/api/user';
import { getFriends } from '@/api/friend';

interface MainContentProps {
  alarmNumber: number;
}

const MainContent = memo(({ alarmNumber }: MainContentProps) => {
  console.log('🟢 MainContent 컴포넌트 시작, alarmNumber:', alarmNumber);

  const [notificationCount, setNotificationCount] = useState(alarmNumber);
  const [friends, setFriends] = useState<User[]>([]);
  const router = useRouter();
  const [status, setStatus] = useState('dm');

  // alarmNumber 변경 시에만 notificationCount 업데이트
  useEffect(() => {
    setNotificationCount(alarmNumber);
  }, [alarmNumber]);

  useEffect(() => {
    console.log('🟡 MainContent router.query:', router.query);
    if (router.query.menu === 'friends') {
      console.log('🟡 친구 모드로 설정');
      setStatus('friends');
    } else {
      console.log('🟡 DM 모드로 설정');
      setStatus('dm');
    }
  }, [router.query.menu]); // menu만 의존성으로 설정

  const fetchFriendRequests = useCallback(async () => {
    console.log('🟡 친구 요청 목록 조회 시작');
    try {
      const { ask_users } = await getFriendRequests();
      console.log('🟢 친구 요청 목록 조회 성공:', ask_users);
      setNotificationCount(ask_users.length);
    } catch (error) {
      console.error('🔴 알람 목록을 가져오는데 실패했습니다:', error);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    console.log('🟡 친구 목록 조회 시작');
    try {
      const response = await getFriends();
      console.log('🟢 친구 목록 조회 성공:', response);
      setFriends(response.friends);
    } catch (error) {
      console.error('🔴 친구 목록을 가져오는데 실패했습니다:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🟡 MainContent API 호출들 시작');
    fetchFriendRequests();
    fetchFriends();
  }, [fetchFriendRequests, fetchFriends]);

  // 메모화된 컴포넌트
  const contentComponent = useMemo(() => {
    return status === 'friends' ? <FriendsList friends={friends} /> : <DirectMessage />;
  }, [status, friends]);

  console.log('🟢 MainContent 렌더링, status:', status, 'notificationCount:', notificationCount);

  return (
    <article className="w-full h-full rounded-r-lg flex-col flex" aria-label="대시보드 메인 콘텐츠">
      <div className="w-full h-[50px] border-b-2 border-umm-gray flex items-center gap-2 px-4 justify-between">
        <div className="flex items-center gap-2 justify-center">
          <FriendButton />
          <AddFriendDialog />
        </div>
        <div className="flex justify-center items-center relative">
          <AlarmDialog
            notificationCount={notificationCount}
            fetchFriendRequests={fetchFriendRequests}
            fetchFriends={fetchFriends}
          />
        </div>
      </div>
      <div className="w-full h-full flex">
        <div className="w-2/3 h-full border-r-2 border-umm-gray p-3">{contentComponent}</div>
        <div className="w-1/3 h-full p-3">
          <b>현재 활동 중</b>
        </div>
      </div>
    </article>
  );
});

MainContent.displayName = 'MainContent';

export { MainContent };
