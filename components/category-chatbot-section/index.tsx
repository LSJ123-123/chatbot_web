"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ChatList from "@/components/chat-list";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const supabase = createClient();

const CategoryChatbotSection = () => {
    const [categories, setCategories] = useState([]);
    const [chatbots, setChatbots] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    useEffect(() => {
        fetchCategories();
        fetchChatbots();
    }, []);

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('id');
        
        if (error) {
            console.error('Error fetching categories:', error);
        } else {
            setCategories(data as any);
            setSelectedCategory(data[0]?.id);
        }
    };

    const fetchChatbots = async () => {
        const { data, error } = await supabase
            .from('chatbots')
            .select(`
                id, name, chatbot_desc, img,
                chatbot_categories(category_id)
            `)
            .order('id');
        
        if (error) {
            console.error('Error fetching chatbots:', error);
        } else {
            setChatbots(data as any);
        }
    };

    const filteredChatbots = selectedCategory
        ? chatbots.filter((chatbot : any) => 
            chatbot.chatbot_categories.some((cc : any) => cc.category_id === selectedCategory))
        : chatbots;

    return (
        <div className="w-full max-w-screen container mx-auto p-5">
            <p className="text-2xl font-bold mb-2">챗봇 카테고리</p>
            <div className="flex overflow-x-auto space-x-2 mb-4">
                {categories.map((category : any) => (
                    <Button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <CarouselContent className="flex">
                    {filteredChatbots.map((chatbot : any) => (
                        <CarouselItem key={chatbot.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <ChatList 
                                    img={chatbot.img} 
                                    name={chatbot.name} 
                                    desc={chatbot.chatbot_desc} 
                                    link={chatbot.id} 
                                    category={selectedCategory ? selectedCategory : '0'}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="bg-gray-200 p-2 rounded-full absolute top-1/2 left-4 transform -translate-y-1/2 -translate-x-1/2" />
                <CarouselNext className="bg-gray-200 p-2 rounded-full absolute top-1/2 right-4 transform -translate-y-1/2 translate-x-1/2" />
            </Carousel>
        </div>
    );
};

export default CategoryChatbotSection;