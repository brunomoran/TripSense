import React from 'react'
import FollowButton from './FollowButton'
import { ProfileUser } from '../types/User'
import { useAuth } from '../context/AuthContext'

type Props = {
    // Define any props you need here
    profileUser: ProfileUser | null
}

const ProfileHeader = (props: Props) => {
    const { user: currentUser } = useAuth()

    const isOwnProfile = props.profileUser?._id === currentUser?._id

    return (
        <>
            <div>ProfileHeader</div>
            <FollowButton />
        </>
    )
}

export default ProfileHeader