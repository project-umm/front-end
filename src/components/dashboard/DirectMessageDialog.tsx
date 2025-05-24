import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getFriends } from '@/api/friend';
import { createDm } from '@/api/dm';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { HttpStatusCode, AxiosError } from 'axios';
import Router from 'next/router';

interface SearchResult {
  id: string;
  username: string;
  nickname: string;
  isSelected: boolean;
  profile_url?: string;
}

export const DirectMessageDialog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [allFriends, setAllFriends] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (open) {
      const fetchFriends = async () => {
        setIsSearching(true);
        try {
          const friendsData = await getFriends();
          const friends = friendsData.friends.map(friend => ({
            id: friend.username,
            username: friend.username,
            nickname: friend.nickname,
            isSelected: false,
            profile_url: friend.profile_url,
          }));
          setAllFriends(friends);
          setSearchResults(friends);
        } catch (error) {
          console.error('친구 목록을 불러오는 중 오류가 발생했습니다:', error);
          setAllFriends([]);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };
      fetchFriends();
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(allFriends);
      return;
    }
    const filteredResults = allFriends.filter(
      user =>
        user.nickname.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    setSearchResults(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isSelected: checked } : { ...user, isSelected: false }
      )
    );
    setAllFriends(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isSelected: checked } : { ...user, isSelected: false }
      )
    );
  };

  const handleCreateDM = async () => {
    const selectedUser = searchResults.find(user => user.isSelected);
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await createDm();
      setSearchResults(allFriends.map(f => ({ ...f, isSelected: false })));
      setSearchQuery('');
      setOpen(false);
      Router.push(`/dashboard?menu=dm&dm_id=${response.dm_id}`);
    } catch (error: unknown) {
      console.error('DM 생성 중 오류가 발생했습니다:', error);
      if (error instanceof AxiosError && error.response?.status === HttpStatusCode.BadRequest) {
        alert(error.response.data.message);
      } else {
        alert('DM 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUser = searchResults.find(user => user.isSelected);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="w-full flex items-center justify-between">
          <b className="text-md">다이렉트 메세지</b>
          <button onClick={() => setOpen(!open)} className="flex">
            <FontAwesomeIcon
              icon={faPlus}
              className="text-sm hover:bg-umm-gray p-1 rounded-full transition-colors cursor-pointer"
            />
          </button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] min-h-[300px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">친구 선택하기</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              placeholder="닉네임으로 검색하기"
              value={searchQuery}
              onChange={e => handleSearchInputChange(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="min-h-[200px] border overflow-y-auto border-umm-gray rounded-lg">
            {searchResults.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between space-x-2 p-2 hover:bg-umm-gray rounded-lg cursor-pointer"
                    onClick={() => handleCheckboxChange(user.id, !user.isSelected)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border-[#222225] border">
                        {user.profile_url ? (
                          <Image
                            src={user.profile_url}
                            alt={`${user.nickname}의 프로필`}
                            fill
                            className="object-cover "
                          />
                        ) : (
                          <Image
                            src="/favicon.ico"
                            alt="기본 프로필"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {user.nickname}
                      </span>
                    </div>
                    <Checkbox
                      id={user.id}
                      checked={user.isSelected}
                      onCheckedChange={checked => handleCheckboxChange(user.id, checked as boolean)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="text-center text-gray-500 flex justify-center items-center h-full">
                친구 목록을 불러오는 중...
              </div>
            )}

            {searchResults.length === 0 && !isSearching && allFriends.length > 0 && (
              <div className="text-center text-gray-500 w-full h-full flex justify-center items-center">
                검색 결과가 없습니다.
              </div>
            )}

            {searchResults.length === 0 && !isSearching && allFriends.length === 0 && (
              <div className="text-center text-gray-500 w-full h-full flex justify-center items-center">
                친구 목록이 없습니다.
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleCreateDM}
              disabled={!selectedUser || isSubmitting}
              className="bg-umm-gray text-white hover:bg-umm-gray/90 w-full"
            >
              {isSubmitting ? '처리 중...' : `DM 생성`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
