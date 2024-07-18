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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ChatbotDetailData from '@/components/chatbot-detail';
import { RealtimeChannel } from '@supabase/supabase-js';
import { generateOpenAIResponse } from './actions';
import { Loader2 } from 'lucide-react';

type Category = {
    id: number;
    name: string;
};

type Episode = {
    id: number;
    chatbot_id: number;
    episode_number: number;
};

type DetailData = {
    id: number;
    name: string;
    chatbot_desc: string;
    content_desc: string;
    img: string;
    ott_link: string;
    likes: number;
    msg_count: number;
}

export default function ChatBotPage({ params }: { params: { chatbotId: string, category: string, episode: string } }) {
    const [chatbot, setChatbot] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [chatroomId, setChatroomId] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(params.category);
    const [selectedEpisode, setSelectedEpisode] = useState(params.episode);

    const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(null);
    const [animatingText, setAnimatingText] = useState('');
    const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const supabase = createClient()
    const router = useRouter()
    const storageKey = `chatMessages_${params.chatbotId}_${params.category}_${params.episode}`;

    useEffect(() => {
        const initializePage = async () => {
            setIsLoadingMessages(true);

            // 챗봇 ID 확인 및 데이터 fetch
            const { data: chatbot, error: chatbotError } = await supabase
                .from('chatbots')
                .select('*')
                .eq('id', params.chatbotId)
                .single();

            if (chatbotError || !chatbot) {
                router.push('/error?message=' + encodeURIComponent('존재하지 않는 챗봇입니다.'));
                return;
            }

            setChatbot(chatbot as DetailData);

            // 카테고리 및 에피소드 fetch
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('chatbot_categories')
                .select('categories(id, name)')
                .eq('chatbot_id', params.chatbotId);

            const { data: episodesData, error: episodesError } = await supabase
                .from('episodes')
                .select('*')
                .eq('chatbot_id', params.chatbotId)
                .order('episode_number', { ascending: true });

            if (categoriesError || episodesError) {
                console.error('Error fetching categories or episodes:', categoriesError || episodesError);
                router.push('/error?message=' + encodeURIComponent('카테고리 또는 에피소드 정보를 가져오는데 실패했습니다.'));
                return;
            }

            const categories = categoriesData.map((item: any) => item.categories) as Category[];
            const episodes = episodesData as Episode[];

            setCategories(categories);
            setEpisodes(episodes);

            // 카테고리 확인
            const categoryExists = categories.some(c => c.id.toString() === params.category);
            if (!categoryExists) {
                const firstCategory = categories[0];
                if (firstCategory) {
                    const latestEpisode = episodes[episodes.length - 1];
                    if (latestEpisode) {
                        router.push(`/chatBot-page/${params.chatbotId}/${firstCategory.id}/${latestEpisode.id}`);
                    } else {
                        router.push('/error?message=' + encodeURIComponent('유효한 에피소드가 없습니다.'));
                    }
                } else {
                    router.push('/error?message=' + encodeURIComponent('유효한 카테고리가 없습니다.'));
                }
                return;
            }

            // 에피소드 확인
            const episodeExists = episodes.some(e => e.id.toString() === params.episode);
            if (!episodeExists) {
                const latestEpisode = episodes[episodes.length - 1];
                if (latestEpisode) {
                    router.push(`/chatBot-page/${params.chatbotId}/${params.category}/${latestEpisode.id}`);
                } else {
                    router.push('/error?message=' + encodeURIComponent('유효한 에피소드가 없습니다.'));
                }
                return;
            }

            await checkLoginStatus();
            setIsLoadingMessages(false);
        };

        initializePage();
    }, [params.chatbotId, params.category, params.episode]);

    useEffect(() => {
        if (!chatroomId) return;

        const channel = supabase.channel(`chatroom:${chatroomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chatroom_id=eq.${chatroomId}`
            }, handleNewMessage)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `chatroom_id=eq.${chatroomId}`
            }, handleUpdateMessage)
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'messages',
                filter: `chatroom_id=eq.${chatroomId}`
            }, handleDeleteMessageFromSupabase)
            .subscribe();

        setRealtimeChannel(channel);

        return () => {
            if (realtimeChannel) {
                supabase.removeChannel(channel);
            }
        };
    }, [chatroomId]);

    const handleNewMessage = (payload: any) => {
        const newMessage = {
            id: payload.new.id,
            text: payload.new.text,
            sender: payload.new.role,
            date: payload.new.date
        };

        // 이미 애니메이션 중인 메시지는 무시합니다.
        if (newMessage.id === animatingMessageId) {
            return;
        }

        if (newMessage.sender === 'assistant') {
            setAnimatingMessageId(newMessage.id);
            setAnimatingText('');
            animateMessage(newMessage.text, newMessage.id);
        } else {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        }
    };

    const handleUpdateMessage = (payload: any) => {
        const updatedMessage = payload.new;
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === updatedMessage.id
                    ? { ...msg, text: updatedMessage.text }
                    : msg
            )
        );
    };

    const handleDeleteMessageFromSupabase = (payload: any) => {
        const deletedMessageId = payload.old.id;
        setMessages(prevMessages =>
            prevMessages.filter(msg => msg.id !== deletedMessageId)
        );
    };


    // 새로운 useEffect 추가
    useEffect(() => {
        if (chatbot && !isLoadingMessages && messages.length === 0) {
            checkAndGenerateWelcomeMessage();
        }
    }, [chatbot, isLoadingMessages, messages.length]);

    const checkAndGenerateWelcomeMessage = async () => {
        if (isLoggedIn && chatroomId) {
            const { data, error } = await supabase
                .from('messages')
                .select('id, text, date')
                .eq('chatroom_id', chatroomId)
                .order('date', { ascending: true })
                .limit(1);

            if (error) {
                console.error('Error checking welcome message:', error);
                return;
            }

            if (!data || data.length === 0) {
                await generateWelcomeMessage();
            } else {
                setMessages([{ id: data[0].id, text: data[0].text, sender: 'assistant', date: data[0].date }]);
            }
        } else if (!isLoggedIn) {
            const storedMessages = sessionStorage.getItem(storageKey);
            if (!storedMessages || JSON.parse(storedMessages).length === 0) {
                await generateWelcomeMessage();
            } else {
                setMessages(JSON.parse(storedMessages));
            }
        }
    }

    const generateWelcomeMessage = async () => {
        if (chatbot) {
            const name = chatbot.name.split(' (')[0];
            const welcomeMessage = `안녕하세요! ${name}입니다. 무엇을 도와드릴까요?`;

            if (isLoggedIn && chatroomId) {
                const { data, error } = await supabase
                    .from('messages')
                    .insert({
                        chatroom_id: chatroomId,
                        role: 'assistant',
                        text: welcomeMessage,
                        date: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Error generating welcome message:', error);
                    return;
                }

                // Realtime 이벤트가 처리되기를 기다리지 않고 직접 상태를 업데이트합니다.
                const newMessage = { id: data.id, text: data.text, sender: data.role, date: data.date };
                setAnimatingMessageId(data.id);
                setAnimatingText('');
                await animateMessage(newMessage.text, newMessage.id);
            } else {
                const newMessage = { id: Date.now().toString(), text: welcomeMessage, sender: 'assistant', date: new Date().toISOString() };
                setAnimatingMessageId(newMessage.id);
                setAnimatingText('');
                await animateMessage(welcomeMessage, newMessage.id);
                setMessages([newMessage]);
                saveMessagesToSessionStorage([newMessage]);
            }
        }
    }

    const animateMessage = async (text: string, messageId: string) => {
        setIsAnimating(true);
        let animatedText = '';
        for (let i = 0; i < text.length; i++) {
            animatedText += text[i];
            setAnimatingText(animatedText);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        setMessages(prev => {
            // 이미 메시지가 있다면 추가하지 않습니다.
            if (prev.some(msg => msg.id === messageId)) {
                return prev;
            }
            const newMessage = { id: messageId, text, sender: 'assistant', date: new Date().toISOString() };
            return [...prev, newMessage];
        });
        setAnimatingMessageId(null);
        setAnimatingText('');
        setIsAnimating(false);
        scrollToBottom();
    };

    const checkLoginStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user);
        if (user) {
            await fetchOrCreateChatroom(user.id);
        } else {
            setIsLoadingMessages(false);
            loadMessagesFromSessionStorage();
        }
    }

    const saveMessagesToSessionStorage = (newMessages: any[]) => {
        sessionStorage.setItem(storageKey, JSON.stringify(newMessages));
    }

    const loadMessagesFromSessionStorage = () => {
        const storedMessages = sessionStorage.getItem(storageKey);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            generateWelcomeMessage();
        }
    }

    const fetchOrCreateChatroom = async (userId: string) => {
        if (chatroomId) {
            const { data: chatroom, error } = await supabase
                .from('chatrooms')
                .select('*')
                .eq('id', chatroomId)
                .eq('uuid', userId)
                .single();

            if (error) {
                console.error('Error fetching chatroom:', error);
                toast({
                    title: "오류 발생",
                    description: "채팅방을 불러오는 도중 오류가 발생했습니다.",
                    variant: "destructive",
                });
                return;
            }

            if (chatroom) {
                if (chatroom.category !== params.category || chatroom.episode !== params.episode) {
                    setChatroomId(null);
                    fetchOrCreateChatroom(userId);
                    return;
                }
                await fetchMessages(chatroomId);
                return;
            } else {
                setChatroomId(null);
                fetchOrCreateChatroom(userId);
                return;
            }
        }

        const { data: newChatroom, error: insertError } = await supabase.rpc('create_unique_chatroom', {
            p_uuid: userId,
            p_cuid: params.chatbotId,
            p_category: params.category,
            p_episode: params.episode
        });

        if (newChatroom) {
            const newChatroomId = newChatroom[0].chatroom_id;
            setChatroomId(newChatroomId);
            await fetchMessages(newChatroomId);
        } else if (insertError) {
            console.error('Error creating or fetching chatroom:', insertError);
        }
    };

    const fetchMessages = async (chatroomId: number) => {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('id, text, role, date')
            .eq('chatroom_id', chatroomId)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return;
        }

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.role,
            date: msg.date
        }));

        setMessages(formattedMessages);
        setIsLoadingMessages(false);
    };

    const generateBotResponse = async (currentMessages = messages) => {
        setIsGenerating(true);

        const newMessageId = Date.now().toString();

        setAnimatingMessageId(newMessageId);
        setAnimatingText('');
        const name = chatbot.name.split(' (')[0];
        const movie = chatbot.name.split(' (')[1].replace(')', '');

        try {
            // 시스템 프롬프트 생성
            const systemPrompt = `당신은 영화 속 인물인 '${name}'이다. '${name}'가 되어 사용자와 대화하면 된다.
    너와 대화하는 상대와의 관계는 '${categories.find(c => c.id.toString() === selectedCategory)?.name}'이다. 이를 감안하고 대화를해라.`;
            ///너는 현재 에피소드로는 ${episodes.find(e => e.id.toString() === selectedEpisode)?.episode_number}회차까지의 기억을 가지고 있다.

            // 전체 메시지 배열 생성
            const fullMessages = [
                { role: 'system', content: systemPrompt },
                ...currentMessages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }))
            ];

            //console.log('Full messages:', fullMessages);

            // OpenAI API 호출
            const botResponse = await generateOpenAIResponse(fullMessages, params.chatbotId);

            if (!botResponse) {
                throw new Error('봇 응답을 생성하는 데 실패했습니다.');
            }

            //console.log('Bot response:', botResponse);

            const newMessage = {
                id: newMessageId,
                text: botResponse,
                sender: 'assistant',
                date: new Date().toISOString()
            };

            if (isLoggedIn && chatroomId) {
                await supabase
                    .from('messages')
                    .insert({
                        chatroom_id: chatroomId,
                        role: newMessage.sender,
                        text: newMessage.text,
                        date: newMessage.date
                    });
                // 실시간 이벤트가 이 메시지를 처리할 것입니다.
                setIsGenerating(false);
            } else {
                setIsGenerating(false);
                setAnimatingMessageId(newMessage.id);
                setAnimatingText('');
                await animateMessage(botResponse, newMessage.id);

                setMessages(messages => {
                    saveMessagesToSessionStorage(messages);
                    return messages;
                });
            }
        } catch (error) {
            console.error('Error generating bot response:', error);
            toast({
                title: "오류 발생",
                description: "응답 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
                variant: "destructive",
            });
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    inline: "nearest"
                });
            }
        }, 0);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, animatingMessageId]);

    const handleSendMessage = async () => {
        if (inputMessage.trim() === '') return;

        if (messages.length >= 19 && !isLoggedIn) {
            toast({
                title: "로그인 필요",
                description: "더 많은 대화를 위해 로그인이 필요합니다.",
                action: <Button onClick={() => router.push('/login')}>로그인</Button>,
            })
            return;
        }

        const newMessage = {
            id: Date.now().toString(), // 고유 ID 추가
            text: inputMessage,
            sender: 'user',
            date: new Date().toISOString()
        };

        setInputMessage('');

        if (isLoggedIn && chatroomId) {
            await supabase
                .from('messages')
                .insert({
                    chatroom_id: chatroomId,
                    role: newMessage.sender,
                    text: newMessage.text,
                    date: newMessage.date
                });
            // 실시간 이벤트가 이 메시지를 처리할 것입니다.
        } else {
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, newMessage];
                saveMessagesToSessionStorage(updatedMessages);
                return updatedMessages;
            });
        }

        // 봇 응답 생성, 하지만 지연을 둬서 현재 보낸 메세지가 뜨게 함
        setTimeout(() => generateBotResponse([...messages, newMessage]), 500);
    };

    const handleDeleteMessage = async (index: number) => {
        const messageToDelete = messages[index];
        const newMessages = messages.slice(0, index);  // 삭제할 메시지 이전의 메시지만 유지

        if (isLoggedIn && chatroomId) {
            // 선택한 메시지와 그 이후의 모든 메시지 삭제
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('chatroom_id', chatroomId)
                .gte('date', messageToDelete.date);

            if (error) {
                console.error('Error deleting messages:', error);
                return;
            }
        }

        setMessages(newMessages);
        if (!isLoggedIn) {
            saveMessagesToSessionStorage(newMessages);
        }

        if (index === 0) {
            return;
        } else if (messageToDelete.sender === 'assistant') {
            // 삭제된 메시지를 제외하고 봇 응답 생성
            await generateBotResponse(newMessages);
        }
    };

    const handleEditMessage = async (index: number, newText: string) => {
        const messageToUpdate = messages[index];
        const newMessages = messages.slice(0, index + 1);  // 수정된 메시지까지만 유지
        newMessages[index] = { ...messageToUpdate, text: newText };  // 수정된 메시지 반영

        if (isLoggedIn && chatroomId) {
            // 수정된 메시지 이후의 모든 메시지 삭제
            await supabase
                .from('messages')
                .delete()
                .eq('chatroom_id', chatroomId)
                .gt('date', messageToUpdate.date);

            // 메시지 업데이트
            await supabase
                .from('messages')
                .update({ text: newText })
                .eq('id', messageToUpdate.id);
        }

        setMessages(newMessages);  // 상태 업데이트
        if (!isLoggedIn) {
            saveMessagesToSessionStorage(newMessages);
        }

        // 수정된 메시지까지만 포함하여 봇 응답 생성
        await generateBotResponse(newMessages);
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

    const handleRegenerateMessage = async (index: number) => {
        const newMessages = messages.slice(0, index);
        setMessages(newMessages);

        if (isLoggedIn && chatroomId) {
            // 선택한 메시지 이후의 모든 메시지 삭제
            const { error: deleteError } = await supabase
                .from('messages')
                .delete()
                .eq('chatroom_id', chatroomId)
                .gte('id', messages[index].id);

            if (deleteError) {
                console.error('Error deleting subsequent messages:', deleteError);
                return;
            }
        }

        if (!isLoggedIn) {
            saveMessagesToSessionStorage(messages.slice(0, index));
        }

        await generateBotResponse(newMessages);
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

    return (
        <div className='flex flex-col h-[calc(100vh-200px)] w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-6 bg-zinc-100 rounded-lg shadow-lg'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 ml-2'>
                <div className='flex items-center mb-4 sm:mb-0'>
                    <Avatar className="h-10 w-10 sm:h-14 sm:w-14 mr-3">
                        <AvatarImage src={chatbot ? chatbot.img : null} alt="Profile" />
                        <AvatarFallback>{chatbot ? chatbot.name.charAt(0) : '로딩'}</AvatarFallback>
                    </Avatar>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Label className='text-xl sm:text-2xl font-bold text-zinc-800'>{chatbot ? chatbot.name : '로딩 중...'}</Label>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] sm:w-[500px] p-5">
                            {chatbot && (
                                <ChatbotDetailData
                                    id={chatbot.id}
                                    name={chatbot.name}
                                    chatbot_desc={chatbot.chatbot_desc}
                                    content_desc={chatbot.content_desc}
                                    img={chatbot.img}
                                    ott_link={chatbot.ott_link}
                                />
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
                <div className='flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2'>
                    <Select
                        value={selectedCategory}
                        onValueChange={(value) => {
                            setSelectedCategory(value);
                            router.push(`/chatBot-page/${params.chatbotId}/${value}/${selectedEpisode}`);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue>{categories.find(c => c.id.toString() === selectedCategory)?.name || "카테고리 선택"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {episodes.length > 0 && episodes[0].episode_number !== 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Select
                                            value={selectedEpisode}
                                            onValueChange={() => { }}
                                            disabled={true}
                                        >
                                            <SelectTrigger className="w-full sm:w-[80px] cursor-not-allowed">
                                                <SelectValue>{episodes.find(e => e.id.toString() === selectedEpisode)?.episode_number + '회' || "회차 선택"}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {episodes.map((episode) => (
                                                    <SelectItem key={episode.id} value={episode.id.toString()}>{episode.episode_number}회</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side='bottom'>
                                    <Label className='text-zinc-800'>추가되지 않은 기능입니다.</Label>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            <ScrollArea className='flex-grow mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-inner'>
                <div className='space-y-4'>
                    {isLoadingMessages ? (
                        <div className='flex items-center justify-center h-40'>
                            <Loader2 className='w-8 h-8 sm:w-10 sm:h-10 animate-spin mr-4' />
                            <Label className='text-base sm:text-lg text-zinc-800'>메시지를 불러오는 중입니다...</Label>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => (
                                <ChatBox
                                    key={message.id}
                                    message={message}
                                    onDelete={() => handleDeleteMessage(index)}
                                    onEdit={(newText) => handleEditMessage(index, newText)}
                                    onCopy={() => handleCopyMessage(message.text)}
                                    onRegenerate={() => handleRegenerateMessage(index)}
                                    onTogglePlay={() => handleTogglePlay(index)}
                                    isPlaying={playingIndex === index}
                                />
                            ))}
                            {animatingMessageId && (
                                <ChatBox
                                    message={{ text: animatingText, sender: 'assistant' }}
                                    onDelete={() => { }}
                                    onEdit={() => { }}
                                    onCopy={() => { }}
                                    onRegenerate={() => { }}
                                    onTogglePlay={() => { }}
                                    isPlaying={false}
                                    isLoading={isGenerating}
                                />
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4'>
                <Input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="메시지를 입력해주세요"
                    className='flex-grow bg-white text-base sm:text-lg'
                    disabled={isGenerating}
                />
                <Button
                    type="submit"
                    className='bg-zinc-700 hover:bg-zinc-600 text-white px-4 sm:px-6 py-2 text-base sm:text-lg w-full sm:w-auto'
                    disabled={isGenerating || isAnimating}
                >
                    전송
                </Button>
            </form>
            <Toaster />
        </div>
    );
}
