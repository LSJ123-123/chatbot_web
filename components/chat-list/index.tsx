
import Profile, { ProfileType } from "@/components/profile";
import { CardContent } from "@/components/ui/card"
import Link from "next/link";

//챗봇의 사진, 이름, 설명
interface ChatBotProps {
    img: string;
    name: string;
    desc: string;
    link?: string;
}

const ChatList = ({ img, name, desc, link }: ChatBotProps) => (
    //일정 크기 유지하도록
    <CardContent className="flex flex-col items-center justify-center"> {/* 없애도 무방함 */}
        <Link href={link ? `/chatBot-page/${link}` : "/"}>
            {/* profile 컴포넌트 사용 */}
            <Profile type={ProfileType.Chatbot} data={{
                name: name,
                made: '2024.07.06',
                description: desc,
                imageUrl: img
            }} />
        </Link>
    </CardContent >
);

export default ChatList;
