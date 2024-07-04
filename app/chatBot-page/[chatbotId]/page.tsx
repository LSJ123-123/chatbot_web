"use client"

import ChatBox from '@/components/chat-box';
import { useState, useRef } from 'react';

export default function ChatBotPage({ params }: { params: any }) {
    const [messages, setMessages] = useState<any[]>([]); // 메시지를 저장할 상태
    const msgRef = useRef(messages);
    msgRef.current = messages;
    const [inputMessage, setInputMessage] = useState<string>(''); // 입력 필드의 메시지 상태

    // 메시지를 보내는 함수
    const handleSendMessage = () => {
        if (inputMessage.trim() !== '') {
            const newMessage = { text: inputMessage, sender: 'user' }; // 사용자가 보낸 메시지
            setMessages([...messages, newMessage]); // 기존 메시지에 새로운 메시지 추가
            setInputMessage(''); // 입력 필드 초기화

            // 챗봇의 응답 시뮬레이션 (실제 챗봇과의 상호작용으로 대체해야 함)
            setTimeout(() => {
                const botResponse = { text: `Response from ${params.chatbotId}`, sender: 'bot' }; // 챗봇의 응답
                setMessages([...msgRef.current, botResponse]); // 기존 메시지에 챗봇의 응답 추가
            }, 500); // 응답 지연 시간 시뮬레이션
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1 className="text-center">{params.chatbotId}와 채팅하기</h1>
            <div style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px', padding: '10px' }}>
                {messages.map((message, index) => (
                    <ChatBox key={index} message={message} />
                ))}
            </div>
            <div style={{ display: 'flex' }}>
                <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="메시지를 입력해주세요" style={{ flex: '1', padding: '10px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <button onClick={handleSendMessage} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>전송</button>
            </div>
        </div>
    );
}