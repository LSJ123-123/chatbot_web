"use client"
import { MenuIcon, Home, Clock, PanelLeftClose } from "lucide-react";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '@/utils/supabase/client';

interface Chatbot {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Chatroom {
    id: number;
    cuid: number;
    category: string;
    episode: string;
    name: string;
}

const SheetMenu = () => {
    const [recentChatrooms, setRecentChatrooms] = useState<Chatroom[]>([]);
    const [user, setUser] = useState<any>(null); // Replace 'any' with actual user type

    const supabase = createClient();

    useEffect(() => {
        const fetchRecentChatrooms = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData.user) {
                return;
            }

            setUser(userData.user);

            const { data: chatroomData, error: chatroomError } = await supabase
                .from('chatrooms')
                .select('id, cuid, category, episode')
                .eq('uuid', userData.user.id)
                .order('last_date', { ascending: false })
                .limit(5);

            if (chatroomError) {
                console.error('Error fetching recent chatrooms:', chatroomError);
                return;
            }

            const chatroomIds = chatroomData.map(chatroom => chatroom.cuid);

            const { data: chatbotData, error: chatbotError } = await supabase
                .from('chatbots')
                .select('id, name')
                .in('id', chatroomIds);

            if (chatbotError) {
                console.error('Error fetching chatbots:', chatbotError);
                return;
            }

            const chatbotsMap = chatbotData.reduce((map: Record<number, Chatbot>, bot: Chatbot) => {
                map[bot.id] = bot;
                return map;
            }, {});

            const recentChatbots = chatroomData.map(chatroom => ({
                ...chatroom,
                name: chatbotsMap[chatroom.cuid]?.name || 'Unknown',
            }));

            setRecentChatrooms(recentChatbots);
        };

        fetchRecentChatrooms();
    }, []);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="h-10 w-10" variant="secondary" size="icon">
                    <MenuIcon size={24} />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-96 p-0 flex flex-col" side="left">
                <SheetHeader className="p-6 bg-zinc-800 border-b-0 flex-shrink-0">
                    <SheetTitle asChild>
                        <Link href="/" className="inline-block">
                            <Image src="/images/logo.svg" alt="logo" width={180} height={60} priority />
                        </Link>
                    </SheetTitle>
                    <SheetDescription id="sheet-description" className="sr-only">
                        Navigation menu and user profile
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col flex-grow overflow-y-auto bg-gray-100">
                    <div className="px-6 py-8 space-y-8">
                        <nav>
                            <Link href="/" className="flex items-center space-x-3 text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors">
                                <Home size={24} />
                                <span>메인 페이지</span>
                            </Link>
                        </nav>

                        <div>
                            <h3 className="mb-4 text-lg font-semibold flex items-center text-gray-800">
                                <Clock size={24} className="mr-3" />
                                Recent
                            </h3>
                            <ul className="space-y-3">
                                {recentChatrooms.map((chatroom) => (
                                    <li key={chatroom.id}>
                                        <Link href={`/chatBot-page/${chatroom.cuid}/${chatroom.category}/${chatroom.episode}`} className="text-base text-gray-700 hover:text-gray-900 transition-colors">
                                            {chatroom.name} / {chatroom.category} / {chatroom.episode}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-auto border-t border-gray-300 bg-white flex-shrink-0">
                    {user && (
                        <div className="p-6">
                            {/* Render user profile here */}
                        </div>
                    )}
                    <SheetClose asChild>
                        <Button variant="ghost" className="w-full py-4 flex items-center justify-center space-x-2 text-base font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                            <PanelLeftClose />
                            <span>메뉴 닫기</span>
                        </Button>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SheetMenu;
