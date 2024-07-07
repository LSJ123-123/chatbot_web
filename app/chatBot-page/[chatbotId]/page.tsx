"use client"

import ChatBox from '@/components/chat-box';
import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatBotPage({ params }: { params: any }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (inputMessage.trim() !== '') {
            const newMessage = { text: inputMessage, sender: 'user' };
            setMessages(prev => [...prev, newMessage]);
            setInputMessage('');

            setTimeout(() => {
                const botResponse = { text: `Response from ${params.chatbotId}`, sender: 'bot' };
                setMessages(prev => [...prev, botResponse]);
            }, 500);
        }
    };

    return (
        <div className='flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto p-6 bg-zinc-100 rounded-lg shadow-lg'>
            <div className='flex items-center mb-6 ml-2'>
                <div className='w-14 h-14 bg-zinc-300 rounded-full mr-4'></div>
                <Label className='text-2xl font-bold text-zinc-800'>{params.chatbotId}</Label>
            </div>
            <ScrollArea className='flex-grow mb-6 p-6 bg-white rounded-lg shadow-inner'>
                <div className='space-y-4'>
                    {messages.map((message, index) => (
                        <ChatBox key={index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className='flex space-x-4'>
                <Input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="메시지를 입력해주세요"
                    className='flex-grow bg-white text-lg'
                />
                <Button
                    type="submit"
                    className='bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 text-lg'
                >
                    전송
                </Button>
            </form>
        </div>
    );
}