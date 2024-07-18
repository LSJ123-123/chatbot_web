"use client";

import { useState } from 'react';
import ChatList from "@/components/chat-list";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const ClientCategorySection = ({ initialCategories, initialChatbots, shuffledChatbotsByCategory } : any) => {
    const [selectedCategory, setSelectedCategory] = useState(initialCategories[0]?.id);

    const displayChatbots = selectedCategory
        ? shuffledChatbotsByCategory[selectedCategory]
        : initialChatbots;

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full max-w-screen container mx-auto p-5"
        >
            <p className="text-2xl font-bold mb-2">챗봇 카테고리</p>
            <div className="flex overflow-x-auto space-x-2 mb-4">
                {initialCategories.map((category : any) => (
                    <Button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>

            <CarouselContent className="flex">
                {displayChatbots.map((chatbot : any) => (
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
            <CarouselPrevious className="bg-gray-200 p-2 rounded-full absolute top-[62.5%] left-4 transform -translate-y-1/2 -translate-x-1/2" />
            <CarouselNext className="bg-gray-200 p-2 rounded-full absolute top-[62.5%] right-4 transform -translate-y-1/2 translate-x-1/2" />
        </Carousel>
    );
};

export default ClientCategorySection;