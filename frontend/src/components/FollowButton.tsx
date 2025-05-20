import { useState } from 'react'
import axios from 'axios'

type Props = {
  userId: string,
  isFollowing: boolean,
}

const FollowButton = ({ userId, isFollowing: initialState }: Props) => {
  const [isFollowing, setIsFollowing] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const url = `/auth/users/${userId}/${isFollowing ? "unfollow" : "follow"}`;
      await axios.post(url);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error al seguir/dejar de seguir", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`follow-button ${isFollowing ? "following" : ""}`}
      onClick={handleClick}
      disabled={loading}
    >
      {isFollowing ? "Siguiendo" : "Seguir"}
    </button>
  );
}

export default FollowButton