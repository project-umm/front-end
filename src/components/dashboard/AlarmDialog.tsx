import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faDownload } from '@fortawesome/free-solid-svg-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getFriendRequests, answerFriendRequest, FriendRequest } from '@/api/friend';

// OS 감지 함수
const getOS = () => {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('linux')) return 'linux';
  return 'unknown';
};

interface AlarmDialogProps {
  notificationCount?: number;
}

export const AlarmDialog = ({ notificationCount = 0 }: AlarmDialogProps) => {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsElectron(userAgent.indexOf('electron/') > -1);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getFriendRequests();
      setRequests(response.ask_users);
    } catch (error) {
      console.error('친구 요청 목록을 불러오는데 실패했습니다:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRequests();
    }
  }, [open]);

  const handleDownload = () => {
    const os = getOS();
    let downloadUrl = '';

    switch (os) {
      case 'windows':
        downloadUrl =
          'https://github.com/project-umm/front-end/releases/download/latest/UMM-Setup-0.1.0.exe';
        break;
      case 'mac':
        downloadUrl =
          'https://github.com/project-umm/front-end/releases/download/latest/UMM-0.1.0.dmg';
        break;
      default:
        alert('지원하지 않는 운영체제입니다.');
        return;
    }

    window.location.href = downloadUrl;
  };

  const handleAnswer = async (askId: number, answer: boolean) => {
    try {
      await answerFriendRequest(askId, answer);
      await fetchRequests();
    } catch (error) {
      console.error('친구 요청 응답 중 오류가 발생했습니다:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer relative">
          <FontAwesomeIcon
            icon={faBell}
            className="text-2xl hover:bg-umm-gray rounded-full transition-colors p-1"
          />
          {notificationCount > 0 && (
            <div className="absolute bottom-1 right-0 translate-x-1/2 translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </div>
          )}
        </button>
      </DialogTrigger>
      {isElectron ? null : (
        <button onClick={handleDownload} className="cursor-pointer ml-2" title="앱 다운로드">
          <FontAwesomeIcon
            icon={faDownload}
            className="text-2xl hover:bg-umm-gray rounded-full transition-colors p-1"
          />
        </button>
      )}
      <DialogContent className="sm:max-w-[425px] bg-black text-white border-[#222225]">
        <DialogHeader className="flex flex-row items-center justify-between mb-2">
          <DialogTitle className="text-lg font-bold">알림</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 min-h-[200px]">
          <span>친구요청</span>
          {requests.map(request => (
            <div key={request.ask_id} className="flex items-start justify-between w-full h-full">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-600 border-[#222225] border">
                  {request.profile_url ? (
                    <Image
                      src={request.profile_url}
                      alt={`${request.nickname}의 프로필`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image src="/favicon.ico" alt="기본 프로필" fill className="object-cover" />
                  )}
                </div>
                <span className="text-sm font-medium">{request.nickname}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnswer(request.ask_id, true)}
                  className="px-3 py-1 bg-[#222225] text-white rounded text-sm hover:bg-[#222225]/90"
                >
                  수락
                </button>
                <button
                  onClick={() => handleAnswer(request.ask_id, false)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  거절
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center text-gray-400 w-full h-full flex justify-center items-center">
              새로운 친구 요청이 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
