import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Router from 'next/router';

export const FriendButton = () => {
  const handleClickFriends = () => {
    Router.push('/dashboard?menu=friends');
  };

  return (
    <button
      className="hover:bg-umm-gray flex items-center gap-2 text-white rounded-lg whitespace-nowrap p-1 cursor-pointer px-2 ml-2
    "
      onClick={handleClickFriends}
    >
      <FontAwesomeIcon icon={faUser} className="text-xl" />
      <b>친구</b>
    </button>
  );
};
