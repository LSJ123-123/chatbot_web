import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LikeButton from '@/components/like';
import { createClient } from '@/utils/supabase/client';

interface ChatbotDetailDataProps {
    id: number;
    name: string;
    chatbot_desc: string;
    img: string;
    content_desc: string;
    ott_link: string;
}

const ChatbotDetailData = ({
    id,
    name,
    chatbot_desc,
    img,
    content_desc,
    ott_link
}: ChatbotDetailDataProps) => {
    const [likes, setLikes] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrCreateLikes = async () => {
            // 먼저 chatbot_stats에서 데이터를 가져오기 시도
            let { data, error } = await supabase
                .from('chatbot_stats')
                .select('likes')
                .eq('chatbot_id', id)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {  // 데이터가 없는 경우
                    // chatbot_stats에 새 레코드 삽입
                    const { data: insertedData, error: insertError } = await supabase
                        .from('chatbot_stats')
                        .insert({ chatbot_id: id, likes: 0, msg_count: 0 })
                        .select()
                        .single();
                    
                    if (insertError) {
                        console.error('Error inserting new chatbot_stats:', insertError);
                    } else {
                        data = insertedData;
                    }
                } else {
                    console.error('Error fetching likes:', error);
                }
            }
            
            if (data) setLikes(data.likes);
        };

        fetchOrCreateLikes();

        // 실시간 구독 설정
        const channel = supabase
            .channel(`chatbot_stats:${id}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'chatbot_stats',
                filter: `chatbot_id=eq.${id}`
            }, payload => {
                if (payload.new && 'likes' in payload.new) {
                    setLikes(payload.new.likes);
                }
            })
            .subscribe();

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

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
                <LikeButton chatbotId={id} likes={likes} />
            </div>
        </div>
    );
};

export default ChatbotDetailData;