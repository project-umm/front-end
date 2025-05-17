import { getAccessToken } from '@/api/token';
import { isEmpty } from 'lodash';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlus } from '@fortawesome/free-solid-svg-icons';

const DashboardPage = () => {
  useEffect(() => {
    const accessToken = getAccessToken();
    if (isEmpty(accessToken)) {
      Router.push('/login');
    }
  }, []);

  const FriendButton = () => {
    return (
      <button className="flex items-center gap-2 px-4">
        <FontAwesomeIcon icon={faUser} className="text-xl" />
        <b>친구</b>
      </button>
    );
  };

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full border-umm-gray border-2 rounded-lg flex">
        <aside className="w-[400px] h-full border-umm-gray border-l-2 rounded-lg flex flex-col">
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
          <div className="w-full h-[90px] p-2 border-umm-gray border-t-2 border-r-2">
            <div
              className="w-full h-full border-umm-gray border-2 rounded-lg"
              role="complementary"
              aria-label="사용자 프로필"
            ></div>
          </div>
        </aside>
        <article className="w-full h-full rounded-r-lg" aria-label="대시보드 메인 콘텐츠">
          <div className="w-full h-[45px] border-b-2 border-umm-gray flex items-center gap-2 px-4">
            <FriendButton />
            <button className="bg-umm-gray text-white rounded-lg whitespace-nowrap p-1">
              <b>친구 추가하기</b>
            </button>
          </div>
          <div className="w-full h-full flex ">
            <div className="w-2/3 h-full border-r-2 border-umm-gray"></div>
            <div className="w-1/3 h-full"></div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default DashboardPage;
