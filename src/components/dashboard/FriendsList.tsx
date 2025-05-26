import React, { useEffect, useState } from 'react';
import { getFriends } from '@/api/friend';
import { User } from '@/api/user';
import Image from 'next/image';

export const FriendsList = () => {
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriends();
        setFriends(response.friends);
      } catch (error) {
        console.error('친구 목록을 가져오는데 실패했습니다:', error);
      }
    };

    fetchFriends();
  }, []);

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
