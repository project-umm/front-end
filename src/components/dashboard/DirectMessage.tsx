import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dayjs from 'dayjs';
import { getAccessToken } from '@/api/token';
import { DmChat } from '@/api/dm';
import { getMyProfile } from '@/api/user';

export const DirectMessage = () => {
  const router = useRouter();
  const { dm_id } = router.query;
  const [messages, setMessages] = useState<DmChat[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getMyProfile();
        setCurrentUserName(response.username);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!dm_id) return;

    const token = getAccessToken();

    const client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_API_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('Connected to STOMP');
        client.subscribe(`/sub/${dm_id}`, message => {
          const receivedMessage: DmChat = JSON.parse(message.body);
          setMessages(prev => [...prev, receivedMessage]);
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [dm_id]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !clientRef.current || !dm_id) return;

    clientRef.current.publish({
      destination: `/pub/${dm_id}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        chat_message: inputMessage,
      }),
    });

    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMyMessage = msg.username === currentUserName;

          return (
            <div
              key={index}
              className={`flex items-start gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}
            >
              {!isMyMessage && (
                <Image
                  src={msg.profile_url}
                  alt={msg.nickname}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              )}
              <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                {!isMyMessage && <span className="font-bold text-sm mb-1">{msg.nickname}</span>}
                <div className="flex items-end gap-2">
                  {!isMyMessage && (
                    <div className={`max-w-[70%] break-words bg-umm-gray rounded-lg px-3 py-2`}>
                      <p className="text-white">{msg.chat_message}</p>
                    </div>
                  )}
                  {isMyMessage && (
                    <div className={`max-w-[70%] break-words bg-blue-500 rounded-lg px-3 py-2`}>
                      <p className="text-white">{msg.chat_message}</p>
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    {dayjs(msg.created_at).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} className="pb-3 border-umm-gray">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg border-umm-gray"
            placeholder="메시지를 입력하세요..."
          />
          <button type="submit" className="px-4 py-2 bg-umm-gray text-white rounded-lg">
            전송
          </button>
        </div>
      </form>
    </div>
  );
};
