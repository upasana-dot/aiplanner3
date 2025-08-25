import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';
import { ChatBubbleIcon, SendIcon } from './Icons';

interface ChatWidgetProps {
  destination?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ destination }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const systemInstruction = destination
      ? `You are an expert travel guide for ${destination}. Be friendly and provide concise, helpful answers to user questions about this location.`
      : `You are a helpful, friendly, and knowledgeable general-purpose AI assistant. You can answer questions on any topic.`;
    
    const initialMessage = destination
      ? `Hi! How can I help you with your trip to ${destination}?`
      : `Hi! How can I help you today? Ask me anything!`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        },
      });
      setChat(newChat);
      setMessages([{
        role: 'model',
        text: initialMessage
      }]);
    } catch (error) {
        console.error("Failed to initialize chat:", error)
        setMessages([{
          role: 'model',
          text: `Sorry, the chat service is currently unavailable.`
        }]);
    }
  }, [destination]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await chat.sendMessage({ message: input });
        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I couldn't get a response. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDone = () => {
    setIsSubmitted(true);
    setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => setIsSubmitted(false), 500); // Reset for next open
    }, 2000);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
        aria-label="Open travel guide chat"
      >
        <ChatBubbleIcon className="w-8 h-8" />
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[70vh] max-h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in z-40 border border-gray-200">
          <header className="bg-gray-100 p-4 rounded-t-2xl border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">{destination ? `${destination} Guide` : 'AI Assistant'}</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold text-2xl">&times;</button>
          </header>
          
          {isSubmitted ? (
              <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
                  <h4 className="text-2xl font-bold text-blue-600">Thank You!</h4>
                  <p className="text-gray-600 mt-2">Have a great day!</p>
              </div>
          ) : (
            <>
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-3">
                     <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                        <div className="flex items-center space-x-1">
                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center bg-white rounded-b-2xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={isLoading || !chat}
                />
                <button type="submit" className="ml-3 bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-blue-300 transition" disabled={isLoading || !input.trim()}>
                  <SendIcon className="w-5 h-5" />
                </button>
                 <button type="button" onClick={handleDone} className="ml-2 text-sm font-semibold text-gray-600 hover:text-black">Done</button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;