import { Suspense } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import ChatList from "@/components/chat-list";
import SkeletonChatList from '@/components/skeleton/chat-list';
import { createClient } from '@/utils/supabase/server';

async function getChatbots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('chatbots')
        .select('id, name, chatbot_desc, img')
        .order('id');
    
    if (error) {
        console.error('Error fetching chatbots:', error);
        return [];
    }
    return data;
}

const ChatbotCarousel = async ({ text }: { text: string }) => {
    const chatbots = await getChatbots();

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full max-w-screen container mx-auto p-5"
        >
            <p className="text-2xl font-bold mb-2">{text}</p>
            <CarouselContent className="flex">
                {chatbots.map((chatbot) => (
                    <CarouselItem key={chatbot.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <ChatList 
                                img={chatbot.img} 
                                name={chatbot.name} 
                                desc={chatbot.chatbot_desc} 
                                link={chatbot.id} 
                                category='0'
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="bg-gray-200 p-2 rounded-full absolute top-1/2 left-4 transform -translate-y-1/2 -translate-x-1/2" />
            <CarouselNext className="bg-gray-200 p-2 rounded-full absolute top-1/2 right-4 transform -translate-y-1/2 translate-x-1/2" />
        </Carousel>
    );
};

const Section = ({ text }: { text: string }) => {
    return (
        <Suspense fallback={<SkeletonCarousel />}>
            <ChatbotCarousel text={text} />
        </Suspense>
    );
};

const SkeletonCarousel = () => (
    <div className="w-full max-w-screen container mx-auto p-5">
        <p className="text-2xl font-bold mb-2">Loading...</p>
        <div className="flex overflow-hidden">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="md:basis-1/2 lg:basis-1/3 p-1">
                    <SkeletonChatList />
                </div>
            ))}
        </div>
    </div>
);

export default Section;