import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ChatList from "@/components/chat-list";

const supabase = createClient();

const CategoryRecommendation = ({ category }: { category: any }) => {
    const [chatbots, setChatbots] = useState([]);

    useEffect(() => {
        fetchChatbots();
    }, [category]);

    const fetchChatbots = async () => {
        const { data, error } = await supabase
            .from('chatbots')
            .select(`
        id, name, chatbot_desc, img,
        chatbot_categories!inner(category_id)
      `)
            .eq('chatbot_categories.category_id', category.id)
            .limit(2);

        if (error) {
            console.error('Error fetching chatbots:', error);
        } else {
            setChatbots(data as any);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chatbots.map((chatbot : any) => (
                    <ChatList
                        key={chatbot.id}
                        img={chatbot.img}
                        name={chatbot.name}
                        desc={chatbot.chatbot_desc}
                        link={chatbot.id.toString()}
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoryRecommendation;