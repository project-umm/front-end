import React from 'react';
import Image from 'next/image';
import { clearTokens } from '@/api/token';
import Router from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserProfileProps {
  profileUrl?: string;
  nickname?: string;
}

export const UserProfile = ({ profileUrl, nickname }: UserProfileProps) => {
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    clearTokens();
    Router.push('/login');
    setOpen(false);
  };

  return (
    <div className="w-full h-[90px] p-2 border-umm-gray border-t-2 border-r-2">
      <div
        className="w-full h-full border-[#222225] border-2 rounded-lg flex items-center gap-2 p-2 text-white relative"
        role="complementary"
        aria-label="사용자 프로필"
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full overflow-hidden relative mr-2">
              <Image
                src={profileUrl || '/favicon.ico'}
                alt="프로필 이미지"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              {nickname && <span className="font-medium">{nickname}</span>}
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="p-1 hover:bg-umm-gray rounded-full transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faGear} />
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-umm-gray">
          <DialogHeader>
            <DialogTitle className="text-white">설정</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 min-h-[200px]">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-white hover:text-bold cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
