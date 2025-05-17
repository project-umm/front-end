import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export const FriendButton = () => {
  return (
    <button className="flex items-center gap-2 px-4">
      <FontAwesomeIcon icon={faUser} className="text-xl" />
      <b>친구</b>
    </button>
  );
};
