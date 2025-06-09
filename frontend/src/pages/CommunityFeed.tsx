import { useEffect, useState } from 'react'
import axios from 'axios'
import PostCard from '../components/PostCard'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Post } from '../types/Post'
import { getApiUrl } from '../config/api'

import '../styles/CommunityFeed.css'

const API_URL = getApiUrl()

type Props = {}

const CommunityFeed = (props: Props) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`)
      setPosts(response.data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleLike = async (postId: string) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      fetchPosts()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
        <h1>Comunidad de Viajeros</h1>
        <div className="community-content">
          {loading ? (
            <div className="loading-indicator">Cargando publicaciones...</div>
          ) : posts.length == 0 ? (
            <div className="empty-state">
              <p>Aún no hay publicaciones en la comunidad.</p>
              <p>¡Sé el primero en compartir tu itinerario!</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CommunityFeed