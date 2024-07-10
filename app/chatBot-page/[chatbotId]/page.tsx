"use client"

import ChatBox from '@/components/chat-box';
import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ChatBotPage({ params }: { params: { chatbotId: string } }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [chatroomId, setChatroomId] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        checkLoginStatus();
        loadMessagesFromSessionStorage();
    }, []);

    //로그인 여부에 따라 챗봇의 데이터를 supabase에서 가져올 지 결정하는 함수
    const checkLoginStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user);
        if (user) {
            await fetchOrCreateChatroom(user.id);
        }
    }

    //세션 스토리지에 저장된 채팅 데이터를 가져오는 함수
    const loadMessagesFromSessionStorage = () => {
        const storedMessages = sessionStorage.getItem(`chatMessages_${params.chatbotId}`);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            generateBotResponse(`안녕하세요! ${params.chatbotId}입니다. 무엇을 도와드릴까요?`);
        }
    }

    //비 로그인 시에는 세션 스토리지에 데잍 저저아
    const saveMessagesToSessionStorage = (newMessages: any[]) => {
        sessionStorage.setItem(`chatMessages_${params.chatbotId}`, JSON.stringify(newMessages));
    }

    //채팅방을 생성하거나 이미 있는 채팅방을 가져오는 함수
    const fetchOrCreateChatroom = async (userId: string) => {
        const { data: existingChatroom } = await supabase
            .from('chatrooms')
            .select('id')
            .eq('uuid', userId)
            .eq('cuid', params.chatbotId)
            .single()

        if (existingChatroom) {
            setChatroomId(existingChatroom.id)
            await fetchMessages(existingChatroom.id)
        } else {
            const { data: newChatroom, error } = await supabase
                .from('chatrooms')
                .insert({ uuid: userId, cuid: params.chatbotId })
                .select()
                .single()

            if (error) {
                console.error('Error creating chatroom:', error)
                return
            }

            setChatroomId(newChatroom.id)
            uploadSessionStorageMessages(newChatroom.id)
        }
    }

    //메세지들 가져오는 함수
    const fetchMessages = async (chatroomId: number) => {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chatroom_id', chatroomId)
            .order('date', { ascending: true })

        if (error) {
            console.error('Error fetching messages:', error)
            return
        }

        setMessages(messages.map(msg => ({
            text: msg.text,
            sender: msg.role
        })))
    }

    //셋션 스토리지에 저장된 메세지들은 수퍼베이스에 업로드하는 함수
    const uploadSessionStorageMessages = async (chatroomId: number) => {
        const storedMessages = sessionStorage.getItem(`chatMessages_${params.chatbotId}`);
        if (storedMessages) {
            const messages = JSON.parse(storedMessages);
            for (let msg of messages) {
                await supabase
                    .from('messages')
                    .insert({ chatroom_id: chatroomId, role: msg.sender, text: msg.text })
            }
        }
    }

    //챗봇의 응답을 생성하는 함수
    const generateBotResponse = async (text: string) => {
        setIsGenerating(true);
        let response = '';
        for (let i = 0; i < text.length; i++) {
            response += text[i];
            setMessages(prev => {
                const newMessages = [...prev.slice(0, -1), { text: response, sender: 'bot' }];
                saveMessagesToSessionStorage(newMessages);
                return newMessages;
            });
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        setIsGenerating(false);
        scrollToBottom();

        if (isLoggedIn && chatroomId) {
            await supabase
                .from('messages')
                .insert({ chatroom_id: chatroomId, role: 'bot', text: response })
        }
    };

    //채팅창을 아래로 스크롤하는 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    //메세지가 추가될 때마다 채팅창을 아래로 스크롤하는 함수
    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages]);

    //메세지 전송 함수
    const handleSendMessage = async () => {
        // 메시지가 비어있지 않다면 메시지 전송
        if (inputMessage.trim() !== '') {
            // 로그인하지 않은 사용자가 20개 이상의 메시지를 전송하려고 할 때 로그인 유도
            if (messages.length >= 19 && !isLoggedIn) {
                toast({
                    title: "로그인 필요",
                    description: "더 많은 대화를 위해 로그인이 필요합니다.",
                    action: <Button onClick={() => router.push('/login')}>로그인</Button>,
                })
                return; // 메시지 전송을 중단
            }

            // 메시지 전송
            const newMessage = { text: inputMessage, sender: 'user' };
            setMessages(prev => {
                const newMessages = [...prev, newMessage];
                saveMessagesToSessionStorage(newMessages);
                return newMessages;
            });
            setInputMessage('');

            // 로그인한 사용자가 채팅방이 있을 때 메시지를 데이터베이스에 저장
            if (isLoggedIn && chatroomId) {
                await supabase
                    .from('messages')
                    .insert({ chatroom_id: chatroomId, role: 'user', text: inputMessage })
            }

            // 챗봇 응답 생성 (임시)
            setTimeout(() => {
                const botResponse = `Response from ${params.chatbotId}`;
                setMessages(prev => [...prev, { text: '', sender: 'bot' }]);
                generateBotResponse(botResponse);
            }, 500);
        }
    };

    //메세지 삭제 함수
    const handleDeleteMessage = async (index: number) => {
        setMessages(prev => {
            const newMessages = prev.slice(0, index);
            // 삭제된 메시지가 봇 메시지이고, 이전 메시지가 유저 메시지인 경우에만 새로운 봇 응답 생성
            if (prev[index].sender === 'bot' && index > 0 && prev[index - 1].sender === 'user') {
                newMessages.push({ text: '', sender: 'bot' });
                setTimeout(() => {
                    const botResponse = `New response after deletion from ${params.chatbotId}`;
                    generateBotResponse(botResponse);
                }, 500);
            }
            saveMessagesToSessionStorage(newMessages);
            return newMessages;
        });

        // 로그인한 사용자가 채팅방이 있을 때 메시지를 데이터베이스에서 삭제
        if (isLoggedIn && chatroomId) {
            const messageToDelete = messages[index];
            await supabase
                .from('messages')
                .delete()
                .match({ chatroom_id: chatroomId, role: messageToDelete.sender, text: messageToDelete.text })
        }
    };


    //이 수정 함수는 현재 수파베이스의 데이터에 CRUD 안함. 수정 필요.
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