import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const CustomerChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Chào bạn! Mình là Hướng dẫn viên Ảo. Mình có thể giúp gì cho chuyến đi ẩm thực của bạn tại Quận 4 hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build history context (last 5 messages to save tokens)
      const historyString = newMessages
        .slice(-5)
        .map(m => `${m.role === 'user' ? 'Khách' : 'Hướng dẫn viên'}: ${m.text}`)
        .join('\n');

      const res = await fetch(`${API_BASE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: historyString })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Chat API error');
      }

      setMessages([...newMessages, { role: 'ai', text: data.data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'ai', text: 'Xin lỗi, hiện tại mình đang bị quá tải hoặc đường truyền mạng có vấn đề. Vui lòng thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[450px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in origin-bottom-right transform transition-all">
          
          {/* Header */}
          <div className="bg-[#e65100] text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Hướng dẫn viên Ảo</h3>
                <p className="text-[10px] text-orange-200 uppercase tracking-wide">Quan4 Culinary AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#e65100] text-white rounded-br-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Hỏi về món ăn, địa điểm..."
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-[#e65100] text-white p-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-[#e65100] transition-colors"
            >
              <svg className="w-5 h-5 translate-x-px -translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-[#e65100] to-orange-400 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-2xl border-2 border-white"
        >
          💬
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        </button>
      )}
    </div>
  );
};
