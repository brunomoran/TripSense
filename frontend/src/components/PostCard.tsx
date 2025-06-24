import { useEffect, useState } from 'react'
import { Post } from '../types/Post'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom';
import defaultUserImage from '../assets/default_profile.webp'

type Props = {
    post: Post;
    onLike: (postId: string) => void;
}

const PostCard = (props: Props) => {
  const { user: currentUser } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)

  useEffect(() => {
    if (currentUser && props.post.likes) {
      // Comprueba si el ID del usuario actual está en el array de likes
      const liked = props.post.likes.some(
        // Compara como strings para evitar problemas con objetos ObjectId vs strings
        (likeId) => likeId.toString() === currentUser.id.toString()
      );
      setHasLiked(liked);
    } else {
      setHasLiked(false);
    }
  }, [props.post.likes, currentUser]);

  // Formatear la fecha
  const formattedDate = new Date(props.post.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/user/${props.post.user.userName}`} className="user-info">
          <img 
            src={props.post.user.profilePicture || defaultUserImage} 
            alt={props.post.user.userName} 
            className="user-avatar"
          />
          <span className="username">{props.post.user.userName}</span>
        </Link>
        <span className="post-date">{formattedDate}</span>
      </div>
      
      <div className="post-content">
        {props.post.description && (
          <p className="post-description">{props.post.description}</p>
        )}
        
        <div className="itinerary-preview">
          <Link to={`/itinerary/${props.post.itinerary._id}`} className="itinerary-title">
            <h3>{props.post.itinerary.name}</h3>
          </Link>
          <p className="itinerary-destination">
            <span className="destination-icon">📍</span> {props.post.itinerary.destination}
          </p>
          <p className="itinerary-dates">
            <span className="date-icon">🗓️</span> {props.post.itinerary.startDate} - {props.post.itinerary.endDate}
          </p>
          
          {isExpanded && props.post.itinerary.days && (
            <div className="itinerary-details">
              <p className="itinerary-days-count">
                <span className="days-icon">📆</span> {props.post.itinerary.days.length} día(s)
              </p>
              {props.post.itinerary.completeRoute && (
                <p className="itinerary-distance">
                  <span className="route-icon">🚶</span> Distancia total: {props.post.itinerary.completeRoute.totalDistance}
                </p>
              )}
            </div>
          )}
          
          <button className="expand-button" onClick={toggleExpanded}>
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      </div>
      
      <div className="post-actions">
        <button 
          className={`like-button ${hasLiked ? 'liked' : ''}`} 
          onClick={() => props.onLike(props.post._id)}
        >
          {hasLiked ? '❤️' : '🤍'} {props.post.likes.length} {props.post.likes.length === 1 ? 'Me gusta' : 'Me gustas'}
        </button>
      </div>
    </div>
  )
}

export default PostCard