import Profile, { ProfileType } from "@/components/profile";
import Link from "next/link";

//챗봇의 사진, 이름, 설명
interface ChatBotProps {
    img: string;
    name: string;
    desc: string;
    link?: string;
}

const ChatList = ({ img, name, desc, link }: ChatBotProps) => (
    <Link href={link ? `/chatBot-page/${link}` : "/"}>
        {/* profile 컴포넌트 사용 */}
        <Profile type={ProfileType.Chatbot} data={{
            name: name,
            made: '2024.07.06',
            chat_desc: desc,
            imageUrl: img,
        }} />
    </Link>
);

export default ChatList;
