import FollowButton from './FollowButton'
import { ProfileUser } from '../types/User'

type Props = {
    profileUser: ProfileUser,
    itinerariesLength: number,
}

const ProfileHeader = ({ profileUser, itinerariesLength }: Props) => {

    return (
        <>
            <div className="user-profile-header">
                <img
                    src={profileUser.profilePicture || "/default-profile.png"}
                    alt={`${profileUser?.userName}'s profile`}
                    className="profile-image"
                />
                <div className="profile-info">
                    <h1>{profileUser?.userName}</h1>
                    <div className="stats">
                        <span><strong>{profileUser.followers.length}</strong> Seguidores </span>
                        <span><strong>{profileUser.following.length}</strong> Siguiendo </span>
                        <span><strong>{itinerariesLength}</strong> Publicaciones</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProfileHeader