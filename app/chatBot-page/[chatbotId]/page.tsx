"use client"

import ChatBox from '@/components/chat-box';
import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function ChatBotPage({ params }: { params: any }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages]);

    const generateBotResponse = async (text: string) => {
        setIsGenerating(true);
        let response = '';
        for (let i = 0; i < text.length; i++) {
            response += text[i];
            setMessages(prev => [...prev.slice(0, -1), { text: response, sender: 'bot' }]);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        setIsGenerating(false);
        scrollToBottom();
    };

    useEffect(() => {
        // 초기 인사말 생성
        const initialGreeting = `안녕하세요! ${params.chatbotId}입니다. 무엇을 도와드릴까요?`;
        generateBotResponse(initialGreeting);

        // 컴포넌트 언마운트 시 TTS 정지
        return () => {
            if (utteranceRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSendMessage = () => {
        if (inputMessage.trim() !== '') {
            const newMessage = { text: inputMessage, sender: 'user' };
            setMessages(prev => [...prev, newMessage]);
            setInputMessage('');

            setTimeout(() => {
                const botResponse = `Response from ${params.chatbotId}`;
                setMessages(prev => [...prev, { text: '', sender: 'bot' }]);
                generateBotResponse(botResponse);
            }, 500);
        }
    };

    const handleDeleteMessage = (index: number) => {
        setMessages(prev => {
            const newMessages = prev.slice(0, index);
            if (prev[index].sender === 'bot' && index > 0 && prev[index - 1].sender === 'user') {
                // 봇 메시지를 삭제하고 이전 유저 메시지가 있는 경우에만 재생성
                newMessages.push({ text: '', sender: 'bot' });
                setTimeout(() => {
                    const botResponse = `New response after deletion from ${params.chatbotId}`;
                    generateBotResponse(botResponse);
                }, 500);
            }
            return newMessages;
        });
    };

    const handleEditMessage = (index: number, newText: string) => {
        setMessages(prev => {
            const newMessages = prev.map((msg, i) => i === index ? { ...msg, text: newText } : msg).slice(0, index + 1);
            if (prev[index].sender === 'user' && index < prev.length - 1 && prev[index + 1].sender === 'bot') {
                // 유저 메시지 편집 후 다음 메시지가 봇 메시지인 경우에만 재생성
                newMessages.push({ text: '', sender: 'bot' });
                setTimeout(() => {
                    const botResponse = `New response after edit from ${params.chatbotId}`;
                    generateBotResponse(botResponse);
                }, 500);
            }
            return newMessages;
        });
    };

    const handleCopyMessage = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "복사 완료",
                description: "메시지가 클립보드에 복사되었습니다.",
            });
        }).catch(err => {
            console.error('복사 실패:', err);
            toast({
                title: "복사 실패",
                description: "메시지 복사 중 오류가 발생했습니다.",
                variant: "destructive",
            });
        });
    };

    const handleRegenerateMessage = (index: number) => {
        setMessages(prev => {
            const newMessages = prev.slice(0, index);
            newMessages.push({ text: '', sender: 'bot' });
            const botResponse = `Regenerated response from ${params.chatbotId}`;
            setTimeout(() => generateBotResponse(botResponse), 500);
            return newMessages;
        });
    };

    const handleTogglePlay = (index: number) => {
        if (playingIndex === index) {
            // 현재 재생 중인 메시지를 중지
            window.speechSynthesis.cancel();
            setPlayingIndex(null);
        } else {
            // 이전에 재생 중이던 메시지가 있다면 중지
            if (playingIndex !== null) {
                window.speechSynthesis.cancel();
            }

            // 새 메시지 재생
            const text = messages[index].text;
            utteranceRef.current = new SpeechSynthesisUtterance(text);
            utteranceRef.current.onend = () => setPlayingIndex(null);
            window.speechSynthesis.speak(utteranceRef.current);
            setPlayingIndex(index);
        }
    };

    return (
        <div className='flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto p-6 bg-zinc-100 rounded-lg shadow-lg'>
            <div className='flex items-center mb-6 ml-2'>
                <div className='w-14 h-14 bg-zinc-300 rounded-full mr-4'></div>








                <Popover>
                    <PopoverTrigger asChild>
                        <Label className='text-2xl font-bold text-zinc-800'>{params.chatbotId}</Label>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">넣어야 할 것 고민, 일단 챗봇의 콘텐츠 url</h4>
                                <p className="text-sm text-muted-foreground">
                                    Set the dimensions for the layer.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="width">Width</Label>
                                    <Input
                                        id="width"
                                        defaultValue="100%"
                                        className="col-span-2 h-8"
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="maxWidth">Max. width</Label>
                                    <Input
                                        id="maxWidth"
                                        defaultValue="300px"
                                        className="col-span-2 h-8"
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="height">Height</Label>
                                    <Input
                                        id="height"
                                        defaultValue="25px"
                                        className="col-span-2 h-8"
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="maxHeight">Max. height</Label>
                                    <Input
                                        id="maxHeight"
                                        defaultValue="none"
                                        className="col-span-2 h-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>






            </div>
            <ScrollArea className='flex-grow mb-6 p-6 bg-white rounded-lg shadow-inner'>
                <div className='space-y-4'>
                    {messages.map((message, index) => (
                        <ChatBox
                            key={index}
                            message={message}
                            onDelete={() => handleDeleteMessage(index)}
                            onEdit={(newText) => handleEditMessage(index, newText)}
                            onCopy={() => handleCopyMessage(message.text)}
                            onRegenerate={() => handleRegenerateMessage(index)}
                            onTogglePlay={() => handleTogglePlay(index)}
                            isPlaying={playingIndex === index}
                        />
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
                    disabled={isGenerating}
                />
                <Button
                    type="submit"
                    className='bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 text-lg'
                    disabled={isGenerating}
                >
                    전송
                </Button>
            </form>
            <Toaster />
        </div>
    );
}