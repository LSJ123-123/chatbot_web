
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
    <Link href={link ? `/chatBot-page/${link}` : "/"}>
        <CardContent className="flex flex-col items-center justify-center"> {/* 없애도 무방함 */}
            {/* profile 컴포넌트 사용 */}
            <Profile type={ProfileType.Chatbot} data={{
                name : name,
                made : '2024.07.06',
                description : desc,
                imageUrl : img
            }} />
        </CardContent>
    </Link>
);

export default ChatList;
