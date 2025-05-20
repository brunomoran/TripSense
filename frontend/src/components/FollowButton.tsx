import React from 'react';

type Props = {
  isFollowing: boolean,
  handleFollow: () => void,
}

const FollowButton = ({ isFollowing, handleFollow }: Props) => {

  return (
    <button
      className={`follow-button ${isFollowing ? "following" : ""}`}
      onClick={handleFollow}
    >
      {isFollowing ? "Siguiendo" : "Seguir"}
    </button>
  );
}

export default FollowButton