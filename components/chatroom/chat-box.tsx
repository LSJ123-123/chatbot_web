"use client";
import { useState, useEffect, useRef } from 'react';

//role, msg 두개를 담은 임시 데이터
const data = [
    {
        "role" : "assistant",
        "msg" : "안녕하세요! 저는 봇입니다. 무엇을 도와드릴까요?"
    },
    {
        "role" : "user",
        "msg" : "안녕 만나서 반가워"
    },
    {
        "role" : "assistant",
        "msg" : "그래, 어떻게 지내?"
    },
    {
        "role" : "assistant",
        "msg" : "안녕하세요! 저는 봇입니다. 무엇을 도와드릴까요?"
    },
    {
        "role" : "user",
        "msg" : "안녕 만나서 반가워"
    },
    {
        "role" : "assistant",
        "msg" : "그래, 어떻게 지내?"
    },
    {
        "role" : "assistant",
        "msg" : "안녕하세요! 저는 봇입니다. 무엇을 도와드릴까요?"
    },
    {
        "role" : "user",
        "msg" : "안녕 만나서 반가워"
    },
    {
        "role" : "assistant",
        "msg" : "그래, 어떻게 지내?"
    }
];


export default function ChatBox({ chatBotId }: { chatBotId: string }) {
    return (
        <div className="flex flex-col-reverse p-5 h-[450px] max-h-[450px] overflow-y-scroll mt-8 w-full">
            {data.map((msg: any, i: number) => (
                <ChatBubble key={i} role={msg.role} message={msg.msg} />
            ))}
        </div>
    );
}

function ChatBubble({ role, message }: { role: string, message: string }) {
    const [expanded, setExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const truncatedRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (truncatedRef.current) {
            const lineHeight = parseInt(window.getComputedStyle(truncatedRef.current).lineHeight, 10);
            const maxHeight = lineHeight * 8;
            if (truncatedRef.current.scrollHeight > maxHeight) {
                setNeedsTruncation(true);
            }
        }
    }, [message]);

    const handleExpand = () => {
        setExpanded(true);
    };

    const styles = {
        bubbleContainer: (role: string) => ({
            display: 'flex',
            justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
            margin: '10px 0',
        }),
        bubble: (role: string) => ({
            backgroundColor: role === 'user' ? "#94beb8" : "white",
            border: "1px solid #000",
            margin: role === 'user' ? "0 10px 0 40px" : "0 40px 0 10px",
            padding: "14px",
            borderRadius: "14px",
            maxWidth: "55%",
            width: "fit-content",
            wordBreak: "break-word" as 'break-word',
        }),
        button: {
            color: 'gray',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: '5px 10px',
            borderRadius: '5px',
            backgroundColor: 'transparent',
            border: 'none',
            display: 'block',
            marginTop: '5px',
        },
        truncated: {
            display: '-webkit-box',
            WebkitLineClamp: 8,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        expanded: {
            display: 'block',
        }
    };

    return (
        <div style={styles.bubbleContainer(role)}>
            <div style={styles.bubble(role)}>
                <div
                    ref={truncatedRef}
                    style={expanded ? styles.expanded : styles.truncated}
                >
                    {message}
                </div>
                {needsTruncation && !expanded && (
                    <button onClick={handleExpand} style={styles.button}>
                        전체보기
                    </button>
                )}
            </div>
        </div>
    );
}