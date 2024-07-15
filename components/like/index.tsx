import { useState, useEffect } from 'react';
import { Heart } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

interface LikeButtonProps {
    chatbotId: number;
    likes: number;
}

const LikeButton = ({ chatbotId, likes }: LikeButtonProps) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes);
    const supabase = createClient();

    useEffect(() => {
        setLikeCount(likes);
        checkLikeStatus();
    }, [likes, chatbotId]);

    const checkLikeStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase.rpc('check_chatbot_like', {
                p_user_id: user.id,
                p_chatbot_id: chatbotId
            });
            if (error) console.error('Error checking like status:', error);
            else setLiked(data);
        }
    };

    const toggleLike = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to like this chatbot.');
            return;
        }

        const { data, error } = await supabase.rpc('toggle_chatbot_like', {
            p_user_id: user.id,
            p_chatbot_id: chatbotId
        });

        if (error) console.error('Error toggling like:', error);
        else {
            setLiked(data);
            setLikeCount(prev => data ? prev + 1 : prev - 1);
        }
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