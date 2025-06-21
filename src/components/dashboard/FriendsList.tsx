import React from 'react';
import { User } from '@/api/user';
import Image from 'next/image';

interface FriendsListProps {
  friends: User[];
}

export const FriendsList = ({ friends }: FriendsListProps) => {
  return (
    <div className="w-full h-full flex flex-col gap-2 p-3">
      {friends.map(friend => (
        <div key={friend.username} className="flex items-center gap-4 cursor-pointer">
          <Image
            src={friend.profile_url || '/favicon.ico'}
            alt={friend.nickname}
            width={40}
            height={40}
            className="object-cover border-[#222225] border rounded-full"
          />
          {friend.nickname}
        </div>
      ))}
    </div>
  );
};
