import React, { useEffect, useState } from 'react';
import { FriendButton } from './FriendButton';
import { UserProfile } from './UserProfile';
import { DmList } from '@/api/dm';
import { getDmList } from '@/api/dm';
import Router from 'next/router';
import Image from 'next/image';
import { encryptWithKey } from '@/lib/crypto';
import { DirectMessageDialog } from './direct-message/DirectMessageDialog';
interface SidebarProps {
  profileUrl?: string;
  nickname?: string;
}

export const Sidebar = ({ profileUrl, nickname }: SidebarProps) => {
  const [dmList, setDmList] = useState<DmList[]>([]);

  useEffect(() => {
    const fetchDmList = async () => {
      try {
        const fetchedDmList = await getDmList();
        setDmList(fetchedDmList.dms);
      } catch (error) {
        console.error('Error fetching DM list:', error);
      }
    };

    fetchDmList();
  }, []);

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
            <DirectMessageDialog />
            <div className="w-full h-[calc(100%-2rem)] overflow-y-auto flex flex-col gap-2 py-4">
              {dmList.map(dm => (
                <div key={dm.username} className="flex items-center gap-2 justify-between">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => {
                      Router.push(`/dashboard?menu=dm&dm_id=${encryptWithKey(dm.dm_id)}`);
                    }}
                  >
                    <Image
                      src={dm.profile_url || '/favicon.ico'}
                      alt={dm.nickname}
                      width={30}
                      height={30}
                      className="object-cover border-[#222225] border rounded-full"
                    />
                    {dm.nickname}
                  </div>
                  {!dm.is_read && <div className="w-1 h-1 rounded-full bg-red-500" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      </nav>
      <UserProfile profileUrl={profileUrl} nickname={nickname} />
    </aside>
  );
};
