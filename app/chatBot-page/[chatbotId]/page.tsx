"use client"

import ChatBox from '@/components/chat-box';
import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';

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

    const img: React.CSSProperties = {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '20px'
    }

    return (
        <div className='flex flex-col h-[calc(100vh-180px)] mx-auto p-4 border border-gray-300 rounded-lg'>
            <div className='flex items-center mb-2'>
                <img src="https://via.placeholder.com/50" alt="chatbot" style={img} />
                <Label className='text-lg font-bold'>ChatBot</Label>
            </div>
            <div className='flex-grow overflow-y-auto border border-gray-200 rounded-lg mb-2 p-2'>
                {messages.map((message, index) => (
                    <ChatBox key={index} message={message} />
                ))}
            </div>
            <div className='flex'>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="메시지를 입력해주세요"
                    className='flex-grow p-2 mr-2 rounded border border-gray-300'
                />
                <button
                    onClick={handleSendMessage}
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                >
                    전송
                </button>
            </div>
        </div>
    );
}