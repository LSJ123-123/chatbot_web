'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
    CommandDialogTrigger,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Chatbot = {
    id: string;
    img: string;
    name: string;
    chatbot_desc: string;
}

export function SearchCommand() {
    const router = useRouter()
    const [chatbots, setChatbots] = useState<Chatbot[]>([])
    const supabase = createClient()

    useEffect(() => {
        async function fetchChatbots() {
            const { data, error } = await supabase
                .from('chatbots')
                .select('id, img, name, chatbot_desc')
                .order('name')

            if (error) {
                console.error('Error fetching chatbots:', error)
            } else {
                setChatbots(data || [])
            }
        }

        fetchChatbots()
    }, [])

    const handleSelect = (chatbotId: string) => {
        //카테고리, 회차를 찾아와 해당 페이지로 이동
        async function fetchChatbot() {
            const { data: categoryData, error: categoryError } = await supabase
                .from('chatbot_categories')
                .select('category_id, chatbot_id')
                .eq('chatbot_id', chatbotId)
                .limit(1)

            if (categoryError) {
                console.error('Error fetching chatbot category:', categoryError)
            }

            const { data: episodeData, error: episodeError } = await supabase
                .from('episodes')
                .select('id, episode_number, chatbot_id')
                .eq('chatbot_id', chatbotId)
                .order('episode_number', { ascending: false })
                .limit(1)

            if (episodeError) {
                console.error('Error fetching chatbot episode:', episodeError)
            }

            if (categoryData && episodeData) {
                router.push(`/chatBot-page/${chatbotId}/${categoryData[0].category_id}/${episodeData[0].id}`)
            }
        }

        fetchChatbot();
    }

    return (
        <>
            <CommandDialogTrigger>
                <CommandInput placeholder="캐릭터 검색" />
                <CommandList>
                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                    <CommandGroup heading="캐릭터">
                        {chatbots.map((chatbot) => (
                            <CommandItem
                                key={chatbot.id}
                                onSelect={() => handleSelect(chatbot.id)}
                                className="flex items-center space-x-2 p-2"
                            >
                                <Avatar className="h-8 w-8 mr-6">
                                    <AvatarImage src={chatbot.img} alt="Profile" />
                                    <AvatarFallback>{chatbot.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{chatbot.name}</span>
                                    <span className="text-sm text-muted-foreground">{chatbot.chatbot_desc}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialogTrigger>
        </>
    )
}