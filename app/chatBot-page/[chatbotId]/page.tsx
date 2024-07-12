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
import Profile, { ProfileType } from "@/components/profile";

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

        if (formattedMessages.length === 0) {
            generateWelcomeMessage();
        }
    }

    const generateWelcomeMessage = () => {
        if (chatbot && messages.length === 0) {
            setTimeout(() => generateBotResponse(`안녕하세요! ${chatbot.name}입니다. 무엇을 도와드릴까요?`), 500);
        }
    }

    const uploadSessionStorageMessages = async (chatroomId: number) => {
        const storedMessages = sessionStorage.getItem(`chatMessages_${params.chatbotId}`);
        if (storedMessages) {
            const messages = JSON.parse(storedMessages);
            for (let msg of messages) {
                await supabase
                    .from('messages')
                    .insert({ chatroom_id: chatroomId, role: msg.sender, text: msg.text, date: msg.date })
            }
        }
        sessionStorage.removeItem(`chatMessages_${params.chatbotId}`);
    }

    const generateBotResponse = async (text: string) => {
        setIsGenerating(true);
        let response = '';
        const tempMessageId = `temp_${new Date().getTime()}`;
        setMessages(prev => [...prev, { id: tempMessageId, text: '', sender: 'bot', temporary: true, date: new Date().toISOString() }]);
        for (let i = 0; i < text.length; i++) {
            response += text[i];
            setMessages(prev => prev.map(msg => msg.id === tempMessageId ? { ...msg, text: response } : msg));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        setIsGenerating(false);
        scrollToBottom();

        // Remove temporary message and add the final message
        const finalMessage = { id: tempMessageId, text: response, sender: 'bot', date: new Date().toISOString() };
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId).concat(finalMessage));

        // Save only the final message to DB
        if (isLoggedIn && chatroomId) {
            const savedMessage = await saveMessage(finalMessage);
            if (savedMessage) {
                setMessages(prev => prev.map(msg => msg.id === tempMessageId ? { ...msg, id: savedMessage.id } : msg));
            }
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

            const newMessage = { text: inputMessage, sender: 'user', date: new Date().toISOString() };
            setMessages(prev => [...prev, newMessage]);
            setInputMessage('');

            const savedMessage = await saveMessage(newMessage);
            if (savedMessage) {
                setMessages(prev => prev.map(msg => msg === newMessage ? { ...msg, id: savedMessage.id } : msg));
            }

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
                .insert({ chatroom_id: chatroomId, role: message.sender, text: message.text, date: message.date })
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
        const messageDateToDelete = messageToDelete.date;

        if (!messageDateToDelete) {
            console.error('Message date is undefined');
            return;
        }

        // Remove the message and subsequent messages from state
        setMessages(prev => {
            const newMessages = prev.filter((_, i) => i < index);
            if (!isLoggedIn) {
                saveMessagesToSessionStorage(newMessages);
            }
            return newMessages;
        });

        if (messageToDelete.id && isLoggedIn && chatroomId) {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('chatroom_id', chatroomId)
                .gte('date', messageDateToDelete);

            if (error) {
                console.error('Error deleting messages:', error);
                return;
            }
        }

        // Generate new bot response if the deleted message was a bot message
        if (messageToDelete.sender === 'bot') {
            setTimeout(() => {
                const botResponse = `New response after deletion from ${chatbot.name}`;
                generateBotResponse(botResponse);
            }, 500);
        }
    };

    const handleEditMessage = async (index: number, newText: string) => {
        const messageToUpdate = messages[index];
        const messageDateToUpdate = messageToUpdate.date;

        if (!messageDateToUpdate) {
            console.error('Message date is undefined');
            return;
        }

        if (isLoggedIn && chatroomId) {
            // Delete all subsequent messages in the database
            const { error: deleteError } = await supabase
                .from('messages')
                .delete()
                .eq('chatroom_id', chatroomId)
                .gt('date', messageDateToUpdate);

            if (deleteError) {
                console.error('Error deleting subsequent messages:', deleteError);
                return;
            }

            // Update the message text in the database
            const { error: updateError } = await supabase
                .from('messages')
                .update({ text: newText })
                .eq('id', messageToUpdate.id);

            if (updateError) {
                console.error('Error updating message:', updateError);
                return;
            }
        }

        // Update the message text in state and remove subsequent messages
        setMessages(prev => {
            const newMessages = prev
                .map((msg, i) => (i === index ? { ...msg, text: newText } : msg))
                .filter((msg, i) => i <= index);

            if (!isLoggedIn) {
                saveMessagesToSessionStorage(newMessages);
            }
            return newMessages;
        });

        // Generate new bot response if the edited message was a user message
        if (messageToUpdate.sender === 'user') {
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

    const handleRegenerateMessage = async (index: number) => {
        const messageToRegenerate = messages[index];
        const messageDateToRegenerate = messageToRegenerate.date;

        if (!messageDateToRegenerate) {
            console.error('Message date is undefined');
            return;
        }

        if (isLoggedIn && chatroomId) {
            // Delete the message and all subsequent messages based on the date in the chat room
            const { error: deleteError } = await supabase
                .from('messages')
                .delete()
                .eq('chatroom_id', chatroomId)
                .gte('date', messageDateToRegenerate);

            if (deleteError) {
                console.error('Error deleting subsequent messages:', deleteError);
                return;
            }
        }

        // Remove the message and subsequent messages from state
        setMessages(prev => {
            const newMessages = prev.slice(0, index);
            if (!isLoggedIn) {
                saveMessagesToSessionStorage(newMessages);
            }
            return newMessages;
        });

        // Generate a new bot response
        setTimeout(() => {
            const botResponse = `Regenerated response from ${chatbot.name}`;
            generateBotResponse(botResponse);
        }, 500);
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
                    <PopoverContent className="w-150">
                        {chatbot && (
                            <Profile
                                type={ProfileType.Chatbot}
                                data={{
                                    name: chatbot.name,
                                    made: '',
                                    chat_desc: '',
                                    imageUrl: chatbot.img,
                                    content_desc: chatbot.content_desc,
                                    ott_link: chatbot.ott_link
                                }}
                            />
                        )}
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
