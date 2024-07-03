
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
        <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
            <img src={img} alt="챗봇 이미지" style={{ width: "30px", height: "30px" }} />
            <h3>{name}</h3>
            <p>{desc}</p>
        </CardContent>
    </Link>
);

export default ChatList;


