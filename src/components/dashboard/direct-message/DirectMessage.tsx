import React, { useEffect, useState, memo, useLayoutEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getMyProfile } from '@/api/user';
import { decryptWithKey } from '@/lib/crypto';
import { getIndividualDm, DmChat } from '@/api/dm';
import { getAccessToken } from '@/api/token';
import { Client } from '@stomp/stompjs';
import dayjs from 'dayjs';

const DirectMessage = memo(() => {
  const router = useRouter();
  const { dm_id } = router.query;
  const [inputMessage, setInputMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [decryptedDmId, setDecryptedDmId] = useState<string>('');
  const [messages, setMessages] = useState<DmChat[]>([]);
  const [newMessages, setNewMessages] = useState<DmChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 모든 메시지 합치기
  const allMessages = useMemo(() => {
    return [...messages, ...newMessages];
  }, [messages, newMessages]);

  // 새 메시지 추가 함수
  const addMessage = (newMessage: DmChat) => {
    setNewMessages(prev => [...prev, newMessage]);
    // 스크롤을 맨 아래로
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 컴포넌트 마운트 시 초기화
  useLayoutEffect(() => {
    setMounted(true);
    return () => {
      // 컴포넌트 언마운트 시 WebSocket 연결 정리
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (error) {
          console.log('언마운트 시 연결 정리:', error);
        }
        clientRef.current = null;
      }
    };
  }, []);

  // 사용자 정보 조회
  useEffect(() => {
    if (mounted) {
      const fetchCurrentUser = async () => {
        try {
          const response = await getMyProfile();
          setCurrentUserName(response.username);
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
        }
      };
      fetchCurrentUser();
    }
  }, [mounted]);

  // dm_id 복호화 및 초기화
  useEffect(() => {
    if (dm_id && mounted) {
      try {
        const decrypted = decryptWithKey(dm_id as string);
        setDecryptedDmId(decrypted);
        setMessages([]);
        setNewMessages([]);

        // 메시지 로드 함수를 useEffect 내부에서 정의
        const loadInitialMessages = async () => {
          if (!decrypted || isLoading) return;

          setIsLoading(true);
          try {
            const response = await getIndividualDm(decrypted, 0, 50);
            setMessages(response.chats);
          } catch (error) {
            console.error('메시지 로드 실패:', error);
          } finally {
            setIsLoading(false);
          }
        };

        // 초기 메시지 로드
        loadInitialMessages().then(() => {
          // 스크롤을 맨 아래로
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 500);

          // WebSocket 연결 시작
          setTimeout(() => {
            connectWebSocket(decrypted);
          }, 1000);
        });
      } catch (error) {
        console.error('dm_id 복호화 실패:', error);
        setDecryptedDmId('복호화 실패');
      }
    } else if (!dm_id) {
      setDecryptedDmId('');
      setMessages([]);
      setNewMessages([]);
    }
  }, [dm_id, mounted]);

  // WebSocket 연결 함수 (단순화된 버전)
  const connectWebSocket = (dmId: string) => {
    // 기존 연결 정리
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (error) {
        console.log('기존 연결 정리:', error);
      }
      clientRef.current = null;
    }

    const token = getAccessToken();
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return;
    }

    const client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_API_URL + '/websocket',
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 0, // 자동 재연결 비활성화
      onConnect: () => {
        try {
          client.subscribe(`/sub/dms/${dmId}`, message => {
            const received: DmChat = JSON.parse(message.body);
            addMessage(received);
          });
        } catch (error) {
          console.error('구독 실패:', error);
        }
      },
      onStompError: () => {},
      onWebSocketClose: () => {
        clientRef.current = null;
      },
      onWebSocketError: () => {
        clientRef.current = null;
      },
    });

    try {
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.log('WebSocket 연결 실패:', error);
    }
  };

  // 메시지 전송
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) {
      return;
    }

    if (!clientRef.current?.connected) {
      alert('WebSocket이 연결되지 않았습니다.');
      return;
    }

    try {
      clientRef.current.publish({
        destination: `/pub/dms/${decryptedDmId}`,
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: JSON.stringify({ chat_message: inputMessage }),
      });
      setInputMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  if (!decryptedDmId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>DM을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-105px)]" data-testid="directmessage">
      {/* 메시지 영역 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* 메시지 리스트 */}
        {allMessages.map((message, index) => (
          <div key={`${message.created_at}-${index}`} className="flex items-start space-x-2">
            {message.username === currentUserName ? (
              // 내 메시지: 오른쪽 정렬
              <>
                <div className="flex-1"></div>
                <div className="flex flex-col items-end">
                  <div className="px-4 py-2 rounded-lg bg-umm-gray text-white max-w-xs lg:max-w-md">
                    <div className="break-words">{message.chat_message}</div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500 text-right">
                    {dayjs(message.created_at).format('HH:mm')}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0">
                  {message.profile_url ? (
                    <Image
                      src={message.profile_url}
                      alt={message.nickname}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/favicon.ico"
                      alt="기본 프로필"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  )}
                </div>
              </>
            ) : (
              // 상대방 메시지: 왼쪽 정렬
              <>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0">
                  {message.profile_url ? (
                    <Image
                      src={message.profile_url}
                      alt={message.nickname}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/favicon.ico"
                      alt="기본 프로필"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 max-w-xs lg:max-w-md">
                    <div className="break-words">{message.chat_message}</div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500 text-left">
                    {dayjs(message.created_at).format('HH:mm')}
                  </div>
                </div>
                <div className="flex-1"></div>
              </>
            )}
          </div>
        ))}

        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="border-t border-umm-gray flex gap-2 p-4">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 border rounded-lg border-umm-gray focus:outline-none focus:ring-2 focus:ring-umm-gray"
          placeholder="메시지를 입력하세요..."
        />
        <button
          type="submit"
          className="px-6 py-2 bg-umm-gray text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!inputMessage.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
});

DirectMessage.displayName = 'DirectMessage';

export { DirectMessage };
