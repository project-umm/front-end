import React, { useState, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { getUsers, requestFriend } from '@/api/friend';
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

interface SearchResult {
  id: string;
  username: string;
  nickname: string;
  isSelected: boolean;
  profile_url?: string;
}

export const AddFriendDialog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const users = await getUsers(searchQuery);
      const searchResults = users.users.map(user => ({
        id: user.username,
        username: user.username,
        nickname: user.nickname,
        isSelected: false,
        profile_url: user.profile_url,
      }));
      setSearchResults(searchResults);
    } catch (error) {
      console.error('검색 중 오류가 발생했습니다:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    setSearchResults(prev =>
      prev.map(user => (user.id === userId ? { ...user, isSelected: checked } : user))
    );
  };

  const handleAddFriends = async () => {
    const selectedUsers = searchResults.filter(user => user.isSelected);
    if (selectedUsers.length === 0) return;

    setIsSubmitting(true);
    try {
      const responses = await Promise.all(selectedUsers.map(user => requestFriend(user.username)));
      if (responses[0]?.message) {
        alert(responses[0].message);
        return;
      }
      alert('친구 요청을 보냈습니다.');
      setSearchResults([]);
      setSearchQuery('');
      setOpen(false);
    } catch (error) {
      console.error('친구 추가 중 오류가 발생했습니다:', error);
      alert('친구 요청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = searchResults.filter(user => user.isSelected).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="hover:bg-umm-gray text-white rounded-lg whitespace-nowrap p-1 cursor-pointer">
          <b>친구 추가하기</b>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] min-h-[300px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">친구 추가하기</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              placeholder="닉네임으로 검색하기"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
              size={20}
              onClick={handleSearch}
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
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        {user.profile_url ? (
                          <Image
                            src={user.profile_url}
                            alt={`${user.nickname}의 프로필`}
                            fill
                            className="object-cover"
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
              <div className="text-center text-gray-500 flex justify-center items-center">
                검색 중...
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center text-gray-500 w-full h-full flex justify-center items-center">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleAddFriends}
              disabled={selectedCount === 0 || isSubmitting}
              className="bg-umm-gray text-white hover:bg-umm-gray/90 w-full"
            >
              {isSubmitting
                ? '처리 중...'
                : `친구 추가하기 ${selectedCount > 0 ? `(${selectedCount})` : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
