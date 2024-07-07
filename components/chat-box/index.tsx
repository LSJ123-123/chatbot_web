interface ChatBoxProps {
    message: {
        sender: string;
        text: string;
    }
}

const ChatBox = ({ message }: ChatBoxProps) => {
    return (
        <div className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`inline-block max-w-[70%] px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                    ? 'bg-zinc-700 text-white mr-2' 
                    : 'bg-zinc-200 text-zinc-900 ml-2'
            }`}>
                {message.text}
            </div>
        </div>
    );
};

export default ChatBox;