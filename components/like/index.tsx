import { useState } from 'react';
import { Heart } from "lucide-react";

const LikeButton = () => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const toggleLike = () => {
        if (!liked) {
            setLikeCount(likeCount + 1);
        } else {
            setLikeCount(likeCount - 1);
        }
        setLiked(!liked);
    };

    return (
        <div>
            <button
                className={`flex items-center space-x-2 px-3 py-1 rounded-md focus:outline-none border border-gray-300 ${liked ? 'bg-red-500 text-white' : 'bg-transparent text-black'}`}
                onClick={toggleLike}
            >
                <Heart size={15} />
                <span>{liked ? `Liked! ${likeCount}` : `Like ${likeCount}`}</span>
            </button>
        </div>
    );
};

export default LikeButton;
