"use client"
// 방문했을 때는 최신목록이 안 변하고, 방문 후 메시지를 보내야지 trigger로 인해 최신목록 수정된다.
import { MenuIcon, Home, Clock, PanelLeftClose } from "lucide-react";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '@/utils/supabase/client';
import Profile, { ProfileType } from "@/components/profile";

interface Chatroom {
    id: number;
    cuid: number;
    category: string;
    episode: string;
    name: string;
}

const SheetMenu = () => {
    const [recentChatrooms, setRecentChatrooms] = useState<Chatroom[]>([]);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    

    // 최근 채팅방 목록을 가져오는 함수
    const fetchRecentChatrooms = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
            console.error('Error fetching user:', userError);
            return;
        }

        setUser(userData.user);

        // chatrooms 테이블에서 최근 방문한 5개의 채팅방 데이터를 가져옴
        const { data: chatroomData, error: chatroomError } = await supabase
            .from('chatrooms')
            .select('id, cuid, category, episode, last_date')
            .eq('uuid', userData.user.id)
            .order('last_date', { ascending: false })
            .limit(5);

        if (chatroomError) {
            console.error('Error fetching recent chatrooms:', chatroomError);
            return;
        }

        const chatroomIds = chatroomData.map(chatroom => chatroom.cuid);

        // chatbots 테이블에서 해당 채팅방들의 이름을 가져옴
        const { data: chatbotData, error: chatbotError } = await supabase
            .from('chatbots')
            .select('id, name')
            .in('id', chatroomIds);

        if (chatbotError) {
            console.error('Error fetching chatbots:', chatbotError);
            return;
        }

        // chatbot 데이터를 맵으로 변환
        const chatbotsMap = chatbotData.reduce((map: Record<number, { name: string }>, bot: { id: number, name: string }) => {
            map[bot.id] = { name: bot.name };
            return map;
        }, {});

        // 최종 채팅방 데이터 생성 및 정렬
        const recentChatbots = chatroomData
            .map(chatroom => ({
                ...chatroom,
                name: chatbotsMap[chatroom.cuid]?.name || 'Unknown',
            }))
            .sort((a, b) => new Date(b.last_date).getTime() - new Date(a.last_date).getTime());

        setRecentChatrooms(recentChatbots);
    };

    // 채팅방 방문 시 last_date를 업데이트하는 함수
    const updateLastVisit = async (chatroomId: number) => {
        const { data, error } = await supabase
            .from('chatrooms')
            .update({ last_date: new Date().toISOString() })
            .eq('id', chatroomId);

        if (error) {
            console.error('Error updating last visit:', error);
        } else {
            // 업데이트 성공 시 채팅방 목록 다시 가져오기
            fetchRecentChatrooms();
        }
    };

    useEffect(() => {
        fetchRecentChatrooms();

        // Realtime 구독 설정
        const chatroomSubscription = supabase
            .channel('chatrooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chatrooms' }, (payload) => {
                console.log('Change received!', payload);
                fetchRecentChatrooms();
            })
            .subscribe();

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            chatroomSubscription.unsubscribe();
        };
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
                            <Profile
                                type={ProfileType.Member}
                                data={{
                                    username: user.user_metadata.full_name || "User",
                                    email: user.email || '',
                                    avatarUrl: "https://randomuser.me/api/portraits",
                                }}
                            />
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
