import { useRef, useEffect } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import { DmChat } from '@/api/dm';
import { VariableSizeList as List } from 'react-window';

export const DirectMessageRow = ({
  index,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: DmChat[];
    currentUserName: string;
    itemHeights: React.RefObject<{ [index: number]: number }>;
    listRef: React.RefObject<List | null>;
  };
}) => {
  const { messages, currentUserName, itemHeights, listRef } = data;
  const msg = messages[index];
  const isMyMessage = msg.username === currentUserName;
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rowRef.current) {
      const height = rowRef.current.getBoundingClientRect().height;
      if (itemHeights.current[index] !== height) {
        itemHeights.current[index] = height;
        listRef.current?.resetAfterIndex(index);
      }
    }
  }, [index, itemHeights, listRef]);

  return (
    <div className="py-2">
      <div ref={rowRef} className={`flex gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
        <Image
          src={msg.profile_url || '/favicon.ico'}
          alt={msg.nickname}
          width={16}
          height={16}
          className="rounded-full object-fit w-10 h-10"
        />
        <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
          {!isMyMessage && <span className="font-bold text-sm mb-1">{msg.nickname}</span>}
          <div className="flex items-end gap-2">
            <div className="max-w-[70%] break-words rounded-lg px-3 py-2 bg-umm-gray">
              <p className="text-white">{msg.chat_message}</p>
            </div>
            <span className="text-xs text-gray-500">
              {dayjs(msg.created_at).format('YYYY-MM-DD HH:mm')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
