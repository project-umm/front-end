import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dayjs from 'dayjs';
import { getAccessToken } from '@/api/token';
import { DmChat, getIndividualDm } from '@/api/dm';
import { getMyProfile } from '@/api/user';

export const DirectMessage = () => {
  const router = useRouter();
  const { dm_id } = router.query;
  const [messages, setMessages] = useState<DmChat[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

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

    const fetchDmAndSetupStomp = async () => {
      try {
        const dmResponse = await getIndividualDm(dm_id as string);
        setMessages(dmResponse.chats);

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
          onStompError: frame => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
          },
          onWebSocketError: event => {
            console.error('WebSocket error: ', event);
          },
        });

        client.activate();
        clientRef.current = client;
      } catch (error) {
        console.error('Error fetching DM or setting up STOMP:', error);
      }
    };

    fetchDmAndSetupStomp();

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        console.log('Deactivating STOMP client');
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [dm_id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!userScrolledUp) {
      scrollToBottom();
    }
  }, [messages, userScrolledUp]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isScrolledToBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      if (!isScrolledToBottom) {
        setUserScrolledUp(true);
      } else {
        setUserScrolledUp(false);
      }
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !clientRef.current || !dm_id || !clientRef.current.connected) {
      console.warn('Cannot send message: Not connected, message is empty, or dm_id is missing.');
      return;
    }

    clientRef.current.publish({
      destination: `/pub/${dm_id}`,
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        chat_message: inputMessage,
      }),
    });

    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, index) => {
          const isMyMessage = msg.username === currentUserName;

          return (
            <div
              key={index}
              className={`flex items-start gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}
            >
              {!isMyMessage && msg.profile_url && (
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
                  <div
                    className={`max-w-[70%] break-words rounded-lg px-3 py-2 bg-umm-gray
                    `}
                  >
                    <p className="text-white">{msg.chat_message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {dayjs(msg.created_at).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
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
