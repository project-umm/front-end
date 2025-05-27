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
  const [isLast, setIsLast] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [key, setKey] = useState(0);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [observersActive, setObserversActive] = useState(false);
  const listRef = useRef<List>(null);
  const clientRef = useRef<Client>(null);
  const retryCountRef = useRef(0);
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

    const maxRetries = 5;

    const connectWebSocket = () => {
      const client = new Client({
        brokerURL: process.env.NEXT_PUBLIC_API_URL + '/websocket',
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          retryCountRef.current = 0;
          client.subscribe(`/sub/dms/${decryptedDmId}`, message => {
            const received: DmChat = JSON.parse(message.body);
            setMessages(prev => [...prev, received]);
          });
        },
        onStompError: frame => {
          console.error('STOMP Error:', frame.headers['message']);
        },
        onWebSocketClose: () => {
          if (retryCountRef.current < maxRetries) {
            console.warn(`WebSocket 연결 실패, ${retryCountRef.current + 1}번째 재시도 중...`);
            retryCountRef.current++;
            setTimeout(connectWebSocket, 1000 * retryCountRef.current);
          } else {
            console.error('WebSocket 연결 5회 실패. 더 이상 시도하지 않습니다.');
          }
        },
      });

      client.activate();
      clientRef.current = client;
    };

    try {
      const response = await getIndividualDm(decryptedDmId, key, 50);
      setIsLast(response.is_last);
      setKey(response.key);
      setMessages(response.chats);

      connectWebSocket();
      setObserversActive(true);
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
      setIsLast(response.is_last);
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
      setIsLast(response.is_last);
    } catch (error) {
      console.error('Error fetching next messages:', error);
    } finally {
      setIsLoadingNext(false);
    }
  }, [dm_id, isLoadingNext, key]);

  // Intersection Observer
  useEffect(() => {
    if (!observersActive) return;

    const topObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLast && !isLoadingPrev) {
          fetchPrevMessages();
        }
      },
      { threshold: 0.1 }
    );

    const bottomObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLast && !isLoadingNext) {
          fetchNextMessages();
        }
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
  }, [fetchPrevMessages, fetchNextMessages, isLast, observersActive, isLoadingPrev, isLoadingNext]);

  // 새 메시지 수신/전송 시 스크롤을 맨 아래로
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages]);

  // 메시지 전송
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const decryptedDmId = decryptWithKey(dm_id as string);
    if (!inputMessage.trim() || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/pub/dms/${decryptedDmId}`,
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: JSON.stringify({ chat_message: inputMessage }),
    });
    setInputMessage('');

    // 전송 직후에도 맨 아래로 스크롤
    if (listRef.current) {
      listRef.current.scrollToItem(messages.length, 'end');
    }
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
              itemSize={index => itemHeights.current[index]}
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
