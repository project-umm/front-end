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
      <DialogTrigger>
        <button className="bg-umm-gray text-white rounded-lg whitespace-nowrap p-1">
          <b>친구 추가하기</b>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>친구 추가하기</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
