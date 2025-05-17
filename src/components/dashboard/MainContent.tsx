import React from 'react';
import { FriendButton } from './FriendButton';
import { AddFriendDialog } from './AddFriendDialog';

export const MainContent = () => {
  return (
    <article className="w-full h-full rounded-r-lg flex-col flex" aria-label="대시보드 메인 콘텐츠">
      <div className="w-full h-[45px] border-b-2 border-umm-gray flex items-center gap-2 px-4">
        <FriendButton />
        <AddFriendDialog />
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
