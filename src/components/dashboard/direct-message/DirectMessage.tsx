import React, { useEffect, useState, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'next/router';
import { DirectMessageRow } from './DirectMessageRow';
import { getAccessToken } from '@/api/token';
import { getIndividualDm, DmChat } from '@/api/dm';
import { getMyProfile } from '@/api/user';
import { decryptWithKey } from '@/lib/crypto';
import AutoSizer from 'react-virtualized-auto-sizer';

export const DirectMessage = () => {
  const router = useRouter();
  const { dm_id } = router.query;
  const [messages, setMessages] = useState<DmChat[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [key, setKey] = useState(0);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const listRef = useRef<List>(null);
  const clientRef = useRef<Client>(null);
  const itemHeights = useRef<{ [index: number]: number }>({});

  // 현재 사용자 가져오기
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

  // 초기 메시지 로드 및 STOMP 설정
  const fetchInitialMessages = async () => {
    if (!dm_id) return;
    const decryptedDmId = decryptWithKey(dm_id as string);
    const token = getAccessToken();
    try {
      const response = await getIndividualDm(decryptedDmId, key, 50);
      setKey(response.key);
      setMessages(response.chats);

      const client = new Client({
        brokerURL: process.env.NEXT_PUBLIC_API_URL,
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          client.subscribe(`/sub/${decryptedDmId}`, message => {
            const received: DmChat = JSON.parse(message.body);
            setMessages(prev => [...prev, received]);
          });
        },
      });
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (!dm_id) return;
    fetchInitialMessages();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [dm_id]);

  // 이전 메시지 로드
  const fetchPrevMessages = useCallback(async () => {
    if (isLoadingPrev || !dm_id) return;
    setIsLoadingPrev(true);
    const decryptedDmId = decryptWithKey(dm_id as string);
    try {
      const response = await getIndividualDm(decryptedDmId, key, 50);
      setKey(response.key);
      setMessages(prev => [...response.chats, ...prev]);
    } catch (error) {
      console.error('Error fetching previous messages:', error);
    } finally {
      setIsLoadingPrev(false);
    }
  }, [dm_id, isLoadingPrev, key]);

  // 다음 메시지 로드
  const fetchNextMessages = useCallback(async () => {
    if (isLoadingNext || !dm_id) return;
    setIsLoadingNext(true);
    const decryptedDmId = decryptWithKey(dm_id as string);
    try {
      const response = await getIndividualDm(decryptedDmId, key, 50);
      setKey(response.key);
      setMessages(prev => [...prev, ...response.chats]);
    } catch (error) {
      console.error('Error fetching next messages:', error);
    } finally {
      setIsLoadingNext(false);
    }
  }, [dm_id, isLoadingNext, key]);

  // Intersection Observer
  useEffect(() => {
    const topObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchPrevMessages();
      },
      { threshold: 0.1 }
    );

    const bottomObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchNextMessages();
      },
      { threshold: 0.1 }
    );

    const topSentinel = document.getElementById('top-sentinel');
    const bottomSentinel = document.getElementById('bottom-sentinel');

    if (topSentinel) topObserver.observe(topSentinel);
    if (bottomSentinel) bottomObserver.observe(bottomSentinel);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [fetchPrevMessages, fetchNextMessages]);

  // 메시지 전송
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const decryptedDmId = decryptWithKey(dm_id as string);
    if (!inputMessage.trim() || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/pub/${decryptedDmId}`,
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: JSON.stringify({ chat_message: inputMessage }),
    });
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div id="top-sentinel" />
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={messages.length}
              itemSize={index => itemHeights.current[index] || 80}
              ref={listRef}
              itemData={{ messages, currentUserName, itemHeights, listRef }}
            >
              {DirectMessageRow}
            </List>
          )}
        </AutoSizer>
        <div id="bottom-sentinel" />
      </div>
      <form onSubmit={sendMessage} className="pb-3 border-umm-gray flex gap-2 p-2">
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
      </form>
    </div>
  );
};
