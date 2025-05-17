import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FriendButton } from './FriendButton';
import { UserProfile } from './UserProfile';

export const Sidebar = () => {
  return (
    <aside className="w-[400px] h-full rounded-lg flex flex-col">
      <nav className="w-full h-full flex">
        <section
          className="w-[80px] h-full border-umm-gray border-r-2 flex flex-col"
          aria-label="메인 메뉴"
        >
          <span className="text-4xl text-center p-4 font-chosun">音</span>
        </section>
        <section
          className="w-full h-full min-w-[200px] flex flex-col border-r-2 border-umm-gray"
          aria-label="서브 메뉴"
        >
          <div className="w-full h-[50px] border-b-2 border-umm-gray" />
          <div className="w-full h-[70px] border-b-2 border-umm-gray flex items-center">
            <FriendButton />
          </div>
          <div className="w-full h-full p-3">
            <div className="w-full flex items-center justify-between">
              <b className="text-md">다이렉트 메세지</b>
              <FontAwesomeIcon icon={faPlus} className="text-sm" />
            </div>
          </div>
        </section>
      </nav>
      <UserProfile />
    </aside>
  );
};
