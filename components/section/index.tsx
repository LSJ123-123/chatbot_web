import ChatList from "../chat-list";

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

const Section = ({ text } : { text: string }) => {
    return (
        <div className="container mx-auto p-5">
            <h2>{text}</h2>
            {/* 챗 리스트들이 가로로 무한 스크롤 될 수 있게 스타일, 화면에는 chatlist가 3개만 표시되고, 더 많은건 옆으로 넘길 수 있게, 화면은 고정된 상태로 리스트들만 움직이도록*/}
            <div style={{ display: "flex", overflowX: "scroll", width: "100%", whiteSpace: "nowrap" }}>
                {data.map((chatbot) => (
                    <ChatList img={chatbot.img} name={chatbot.name} desc={chatbot.desc} link={chatbot.link} key={chatbot.name} />
                ))}
            </div>
        </div>
    )
};

export default Section;