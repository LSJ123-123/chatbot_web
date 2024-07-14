import { MenuIcon, Home, Clock, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import Profile, { ProfileType } from "../profile";
import { createClient } from "@/utils/supabase/server";

const fetchRecentChatbots = async () => {
    "use server";

    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        return { recentChatbots: [], user: null };
    }

    const user = userData.user;

    const { data, error } = await supabase
        .from('chatrooms')
        .select('id, cuid, category, episode')
        .eq('uuid', user.id) // 유저의 UUID로 필터링
        .order('last_date', { ascending: true })
        .limit(5);

    if (error) {
        console.error('Error fetching recent chatrooms:', error);
        return { recentChatbots: [], user };
    }

    const { data: chatbots, error: chatbotError } = await supabase
        .from('chatbots')
        .select('id, name')
        .in('id', data.map((chatroom) => chatroom.cuid));

    if (chatbotError) {
        console.error('Error fetching chatbots:', chatbotError);
        return { recentChatbots: [], user };
    }

    // 데이터에 이름을 추가
    const recentChatbots = data.map((chatroom) => {
        const bot = chatbots.find((bot) => bot.id === chatroom.cuid);
        return {
            ...chatroom,
            name: bot?.name || 'Unknown',
        };
    });

    return { recentChatbots, user };
};

const SheetMenu = async () => {
    const { recentChatbots, user } = await fetchRecentChatbots();

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
                                {user ? (
                                    recentChatbots.map((bot) => (
                                        <li key={bot.id}>
                                            <Link href={`/chatBot-page/${bot.cuid}/${bot.category}/${bot.episode}`} className="text-base text-gray-700 hover:text-gray-900 transition-colors">
                                                {bot.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li>
                                        <span className="text-base text-gray-700">로그인 후에 이용 가능합니다.</span>
                                    </li>
                                )}
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
