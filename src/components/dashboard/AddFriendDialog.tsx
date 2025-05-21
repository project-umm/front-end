import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const AddFriendDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="bg-umm-gray text-white rounded-lg whitespace-nowrap p-1 cursor-pointer">
          <b>친구 추가하기</b>
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="min-h-[300px] flex flex-col">
          <DialogHeader>
            <DialogTitle>친구 추가하기</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            {/* 여기에 친구 추가 폼이 들어갈 예정 */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
