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
    const [chatbot, setChatbot] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [chatroomId, setChatroomId] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const initializePage = async () => {
            await fetchChatbot();
            await checkLoginStatus();
        };

        initializePage();
    }, [params.chatbotId]);

    const fetchChatbot = async () => {
        const { data, error } = await supabase
            .from('chatbots')
            .select('*')
            .eq('id', params.chatbotId)
            .single();

        if (error) {
            console.error('Error fetching chatbot:', error);
            return;
        }

        setChatbot(data);
    };

    const checkLoginStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user);
        if (user) {
            await fetchOrCreateChatroom(user.id);
        } else {
            loadMessagesFromSessionStorage();
            setIsLoadingMessages(false);
        }
    }

    const loadMessagesFromSessionStorage = () => {
        const storedMessages = sessionStorage.getItem(`chatMessages_${params.chatbotId}`);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }

    const saveMessagesToSessionStorage = (newMessages: any[]) => {
        sessionStorage.setItem(`chatMessages_${params.chatbotId}`, JSON.stringify(newMessages));
    }

    const saveChatroomId = (id: number) => localStorage.setItem(`chatroomId_${params.chatbotId}`, id.toString());
    const loadChatroomId = () => Number(localStorage.getItem(`chatroomId_${params.chatbotId}`));

    const fetchOrCreateChatroom = async (userId: string) => {
        const existingId = loadChatroomId();
        if (existingId) {
            setChatroomId(existingId);
            await fetchMessages(existingId);
            return;
        }

        const { data: newChatroom, error: insertError } = await supabase.rpc('create_unique_chatroom', {
            p_uuid: userId,
            p_cuid: params.chatbotId
        });

        if (newChatroom) {
            const newChatroomId = newChatroom[0].chatroom_id;
            saveChatroomId(newChatroomId);
            setChatroomId(newChatroomId);
            await fetchMessages(newChatroomId);
        } else if (insertError) {
            console.error('Error creating or fetching chatroom:', insertError);
        }
    };

    const fetchMessages = async (chatroomId: number) => {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chatroom_id', chatroomId)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return;
        }

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.role
        }));

        setMessages(formattedMessages);
        setIsLoadingMessages(false);

        if (formattedMessages.length === 0) {
            generateWelcomeMessage();
        }
    }

    const generateWelcomeMessage = () => {
        if (chatbot && messages.length === 0) {
            generateBotResponse(`안녕하세요! ${chatbot.name}입니다. 무엇을 도와드릴까요?`);
        }
    }

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
        sessionStorage.removeItem(`chatMessages_${params.chatbotId}`);
    }

    const generateBotResponse = async (text: string) => {
        setIsGenerating(true);
        let response = '';
        const tempMessageId = `temp_${new Date().getTime()}`;
        setMessages(prev => [...prev, { id: tempMessageId, text: '', sender: 'bot', temporary: true }]);
        for (let i = 0; i < text.length; i++) {
            response += text[i];
            setMessages(prev => prev.map(msg => msg.id === tempMessageId ? { ...msg, text: response } : msg));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        setIsGenerating(false);
        scrollToBottom();

        // Remove temporary message and add the final message
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId).concat({ text: response, sender: 'bot' }));

        // Save only the final message to DB
        if (isLoggedIn && chatroomId) {
            await saveMessage({ text: response, sender: 'bot' });
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputMessage.trim() !== '') {
            if (messages.length >= 19 && !isLoggedIn) {
                toast({
                    title: "로그인 필요",
                    description: "더 많은 대화를 위해 로그인이 필요합니다.",
                    action: <Button onClick={() => router.push('/login')}>로그인</Button>,
                })
                return;
            }

            const newMessage = { text: inputMessage, sender: 'user' };
            setMessages(prev => [...prev, newMessage]);
            setInputMessage('');

            await saveMessage(newMessage);

            setTimeout(() => {
                const botResponse = `Response from ${chatbot.name}`;
                generateBotResponse(botResponse);
            }, 500);
        }
    };

    const saveMessage = async (message: any) => {
        if (isLoggedIn && chatroomId) {
            const { data, error } = await supabase
                .from('messages')
                .insert({ chatroom_id: chatroomId, role: message.sender, text: message.text })
                .select()
                .single();

            if (error) {
                console.error('Error saving message:', error);
                return null;
            }
            return data;
        } else {
            const newMessages = [...messages, message];
            saveMessagesToSessionStorage(newMessages);
            return message;
        }
    };

    const handleDeleteMessage = async (index: number) => {
        const messageToDelete = messages[index];
        setMessages(prev => {
            const newMessages = prev.filter((_, i) => i !== index);
            if (!isLoggedIn) {
                saveMessagesToSessionStorage(newMessages);
            }
            return newMessages;
        });

        if (isLoggedIn && chatroomId && messageToDelete.id) {
            await supabase
                .from('messages')
                .delete()
                .eq('id', messageToDelete.id)
        }

        if (messageToDelete.sender === 'user' && index < messages.length - 1 && messages[index + 1].sender === 'bot') {
            setTimeout(() => {
                const botResponse = `New response after deletion from ${chatbot.name}`;
                generateBotResponse(botResponse);
            }, 500);
        }
    };

    const handleEditMessage = async (index: number, newText: string) => {
        setMessages(prev => {
            const newMessages = prev.map((msg, i) =>
                i === index ? { ...msg, text: newText } : msg
            );
            if (!isLoggedIn) {
                saveMessagesToSessionStorage(newMessages);
            }
            return newMessages;
        });

        if (isLoggedIn && chatroomId) {
            const messageToUpdate = messages[index];
            if (messageToUpdate.id) {
                await supabase
                    .from('messages')
                    .update({ text: newText })
                    .eq('id', messageToUpdate.id);
            }
        }

        if (messages[index].sender === 'user' && index < messages.length - 1 && messages[index + 1].sender === 'bot') {
            setTimeout(() => {
                const botResponse = `New response after edit from ${chatbot?.name}`;
                generateBotResponse(botResponse);
            }, 500);
        }
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
            const botResponse = `Regenerated response from ${chatbot.name}`;
            setTimeout(() => generateBotResponse(botResponse), 500);
            return newMessages;
        });
    };

    const handleTogglePlay = (index: number) => {
        if (playingIndex === index) {
            window.speechSynthesis.cancel();
            setPlayingIndex(null);
        } else {
            if (playingIndex !== null) {
                window.speechSynthesis.cancel();
            }

            const text = messages[index].text;
            utteranceRef.current = new SpeechSynthesisUtterance(text);
            utteranceRef.current.onend = () => setPlayingIndex(null);
            window.speechSynthesis.speak(utteranceRef.current);
            setPlayingIndex(index);
        }
    };

    useEffect(() => {
        if (!isLoadingMessages && messages.length === 0 && chatbot) {
            generateWelcomeMessage();
        }
    }, [chatbot, isLoadingMessages]);

    return (
        <div className='flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto p-6 bg-zinc-100 rounded-lg shadow-lg'>
            <div className='flex items-center mb-6 ml-2'>
                <div className='w-14 h-14 bg-zinc-300 rounded-full mr-4'></div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Label className='text-2xl font-bold text-zinc-800'>{chatbot ? chatbot.name : 'Loading...'}</Label>
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
