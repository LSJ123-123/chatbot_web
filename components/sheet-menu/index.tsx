import { MenuIcon, Home, Clock, LogOut } from "lucide-react";
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

const recentChatbots = [
    { id: 'chatbot1', name: 'Chatbot 1' },
    { id: 'chatbot2', name: 'Chatbot 2' },
    { id: 'chatbot3', name: 'Chatbot 3' },
    { id: 'chatbot4', name: 'Chatbot 4' },
    { id: 'chatbot5', name: 'Chatbot 5' },
];

const SheetMenu = () => {
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
                                {recentChatbots.map((bot) => (
                                    <li key={bot.id}>
                                        <Link href={`/chatBot-page/${bot.id}`} className="text-base text-gray-700 hover:text-gray-900 transition-colors">
                                            {bot.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-auto border-t border-gray-300 bg-white flex-shrink-0">
                    <div className="p-6">
                        <Profile
                            type={ProfileType.Member}
                            data={{
                                username: "John Doe",
                                email: "abc@tes.com",
                                avatarUrl: "https://randomuser.me/api/portraits",
                            }}
                        />
                    </div>
                    <SheetClose asChild>
                        <Button variant="ghost" className="w-full py-4 flex items-center justify-center space-x-2 text-base font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                            <LogOut size={20} />
                            <span>로그아웃</span>
                        </Button>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default SheetMenu;