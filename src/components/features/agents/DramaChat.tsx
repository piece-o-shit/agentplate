import { useEffect, useState } from 'react';
import { Drama } from '@write-with-laika/drama-engine';
import { initializeDramaEngine } from '@/lib/drama-engine';

interface DramaChatProps {
  chatId: string;
}

export default function DramaChat({ chatId }: DramaChatProps) {
  const [drama, setDrama] = useState<Drama | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    async function setupDrama() {
      const dramaInstance = await initializeDramaEngine();
      dramaInstance.addChat(chatId, "water-cooler", ["Anders", "you"]);
      setDrama(dramaInstance);
    }
    setupDrama();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!drama || !inputMessage.trim()) return;

    const chat = drama.chats.get(chatId);
    if (!chat) return;

    const you = chat.participants['you'];
    if (!you) return;

    chat.appendMessage(you, inputMessage);
    setMessages(prev => [...prev, { sender: 'you', content: inputMessage }]);
    setInputMessage('');

    // Run conversation for up to 1 reply
    await drama.runConversation(chat, 1, undefined, undefined, undefined, (updatedChat) => {
      const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];
      if (lastMessage.sender !== 'you') {
        setMessages(prev => [...prev, {
          sender: lastMessage.sender,
          content: lastMessage.content
        }]);
      }
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'you' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'you'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
