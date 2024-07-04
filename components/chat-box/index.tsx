
interface ChatBoxProps {
    message: {
        sender: string;
        text: string;
    }
}

const ChatBox = ({ message }: ChatBoxProps) => {
    return (
        <div style={{ marginBottom: '10px', textAlign: message.sender === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px', borderRadius: '8px', backgroundColor: message.sender === 'user' ? '#007bff' : '#f1f0f0', color: message.sender === 'user' ? 'white' : 'black' }}>
                {message.text}
            </div>
        </div>
    );
};

export default ChatBox;