import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LikeButton from '@/components/like';

interface ChatbotDetailDataProps {
    id: number;
    name: string;
    chatbot_desc: string;
    img: string;
    content_desc: string;
    ott_link: string;
    likes: number;
    msg_count: number;
}

const ChatbotDetailData = ({
    name,
    chatbot_desc,
    img,
    content_desc,
    ott_link,
    likes,
    msg_count
}: ChatbotDetailDataProps) => {
    return (
        <div className="flex items-center mb-4">
            <Avatar className="h-24 w-24 mr-6">
                <AvatarImage src={img} alt="Profile" />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 mb-1">{name}</p>
                <p className="text-sm text-gray-600 mb-2">{chatbot_desc}</p>
                <p className="text-sm text-gray-600">{content_desc}</p>
                <a href={ott_link} className="text-blue-500 hover:underline text-sm">{ott_link}</a>
                <LikeButton likes={likes} />
            </div>
        </div>
    );
};

export default ChatbotDetailData;
