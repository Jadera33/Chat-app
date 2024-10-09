import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';
import Parse from 'parse';

interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      const query = new Parse.Query('Message');
      query.ascending('createdAt');
      const results = await query.find();
      setMessages(results.map(msg => ({
        id: msg.id,
        text: msg.get('text'),
        sender: msg.get('sender'),
        createdAt: msg.get('createdAt')
      })));
    };

    fetchMessages();
    const subscription = query.subscribe();
    subscription.on('create', (msg) => {
      setMessages(prevMessages => [...prevMessages, {
        id: msg.id,
        text: msg.get('text'),
        sender: msg.get('sender'),
        createdAt: msg.get('createdAt')
      }]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const Message = Parse.Object.extend('Message');
    const message = new Message();
    message.set('text', newMessage);
    message.set('sender', user?.username);

    try {
      await message.save();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-red-600 text-white p-4">
        <h1 className="text-xl font-bold">Chat App</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${
              msg.sender === user?.username ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.sender === user?.username
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              <p className="font-bold">{msg.sender}</p>
              <p>{msg.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {msg.createdAt.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="bg-white p-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 input-primary mr-2"
        />
        <button type="submit" className="btn-primary">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;