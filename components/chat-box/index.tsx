import { useState } from 'react';
import { Trash2, Edit, Copy, RefreshCw, Play, Pause, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatBoxProps {
    message: {
        sender: string;
        text: string;
    };
    onDelete: () => void;
    onEdit: (newText: string) => void;
    onCopy: () => void;
    onRegenerate: () => void;
    onTogglePlay: () => void;
    isPlaying: boolean;
}

const ChatBox = ({ message, onDelete, onEdit, onCopy, onRegenerate, onTogglePlay, isPlaying }: ChatBoxProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text);

    const isUser = message.sender === 'user';

    const handleEdit = () => {
        if (isUser) {
            setIsEditing(true);
        }
    };

    const handleSaveEdit = () => {
        onEdit(editText);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditText(message.text);
        setIsEditing(false);
    };

    return (
        <div 
            className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && !isEditing && isUser && (
                <div className="flex gap-1 mr-2 self-end">
                    <Button variant="ghost" size="icon" onClick={onCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleEdit}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {!isUser && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onTogglePlay} 
                    className="mr-2 self-end"
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
            )}
            <div className={`relative inline-block max-w-[70%] px-4 py-2 rounded-lg ${
                isUser 
                    ? 'bg-zinc-700 text-white' 
                    : 'bg-zinc-200 text-zinc-900'
            }`}>
                {isEditing && isUser ? (
                    <div className="flex items-center">
                        <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="mr-2 text-black"
                        />
                        <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    message.text
                )}
            </div>
            {isHovered && !isEditing && !isUser && (
                <div className="flex gap-1 ml-2 self-end">
                    <Button variant="ghost" size="icon" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onRegenerate}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ChatBox;