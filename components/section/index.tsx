// 크기 조절만 하면 될 거 같음
// import { Card } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import ChatList from "@/components/chat-list";

//활용할 챗봇 정보 임시 데이터
//들어갈 건 챗봇의 이미지, 이름, 간단한 설명
//이걸 chat=list 컴포넌트에 넣어서 map으로 돌리면 될 듯
const data = [
    {
        img: "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_960_720.png",
        name: "챗봇1",
        desc: "챗봇1은 이런저런 기능을 가지고 있습니다.",
        link: "chatbot1"
    },
    {
        img: "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_960_720.png",
        name: "챗봇2",
        desc: "챗봇2는 이런저런 기능을 가지고 있습니다.",
        link: "chatbot2"
    },
    {
        img: "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_960_720.png",
        name: "챗봇3",
        desc: "챗봇3은 이런저런 기능을 가지고 있습니다.",
        link: "chatbot3"
    },
    {
        img: "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_960_720.png",
        name: "챗봇4",
        desc: "챗봇4는 이런저런 기능을 가지고 있습니다.",
        link: "chatbot4"
    },
    {
        img: "https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_960_720.png",
        name: "챗봇5",
        desc: "챗봇5는 이런저런 기능을 가지고 있습니다.",
        link: "chatbot5"
    }
]

const Section = ({ text }: { text: string }) => {
    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full max-w-screen container mx-auto p-5"
        >
            <p className="text-2xl font-bold mb-2">{text}</p>
            <CarouselContent className="flex">
                {/* 챗 리스트들이 가로로 무한 스크롤 될 수 있게 */}
                {/* Carousel Items */}
                {data.map((chatbot, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            {/* <Card>  없애도 무방 */}
                                <ChatList img={chatbot.img} name={chatbot.name} desc={chatbot.desc} link={chatbot.link} key={chatbot.name} />
                            {/* </Card> */}
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="bg-gray-200 p-2 rounded-full absolute top-1/2 left-4 transform -translate-y-1/2 -translate-x-1/2" />
            <CarouselNext className="bg-gray-200 p-2 rounded-full absolute top-1/2 right-4 transform -translate-y-1/2 translate-x-1/2" />
        </Carousel>
    )
};

export default Section;
