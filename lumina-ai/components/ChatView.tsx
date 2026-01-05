
import React, { useState, useRef, useEffect } from 'react';
import { ChatThread } from '../types';
import { Send, ArrowUp, PanelLeftOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatViewProps {
  thread: ChatThread | null;
  onSendMessage: (content: string) => void;
  onNewChat: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  thread, 
  onSendMessage, 
  onNewChat,
  isSidebarOpen,
  toggleSidebar 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-4">
          {!isSidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}
          <h1 className="text-sm font-medium text-gray-500 truncate max-w-[200px] md:max-w-md">
            {thread ? thread.title : 'New Chat'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors">
            Share
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-0 py-10"
      >
        {!thread || thread.messages.length === 0 ? (
          <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Sparkles size={32} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-medium serif tracking-tight">How can I help you today?</h2>
              <p className="text-gray-400 text-sm">Sophisticated reasoning, deep insights, and clear answers.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
              {[
                "Analyze a complex philosophical concept",
                "Write a clean, documented Python script",
                "Draft a professional cover letter",
                "Explain quantum entanglement simply"
              ].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-4 text-left border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-sm group"
                >
                  <span className="text-gray-700">{suggestion}</span>
                  <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Try this &rarr;</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-12 pb-12">
            {thread.messages.map((msg, i) => (
              <div 
                key={msg.id} 
                className={`flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-${Math.min(i * 100, 500)}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                  ${msg.role === 'user' ? 'bg-orange-100 text-orange-600' : 'bg-black text-white'}
                `}>
                  {msg.role === 'user' ? 'U' : 'L'}
                </div>
                <div className="flex-1 space-y-2 prose prose-sm max-w-none">
                  <div className="font-semibold text-xs text-gray-400 uppercase tracking-widest">
                    {msg.role === 'user' ? 'You' : 'Lumina'}
                  </div>
                  <div className="text-gray-800 leading-relaxed text-[15px]">
                    {msg.content === '' ? (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                    ) : (
                      <ReactMarkdown 
                        components={{
                          pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-4 text-xs" {...props} />,
                          code: ({node, ...props}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <form 
            onSubmit={handleSubmit}
            className="relative bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 focus-within:border-gray-400 transition-all p-2 pr-12"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="How can Lumina help you today?"
              className="w-full resize-none bg-transparent py-3 px-4 outline-none text-[15px] leading-normal max-h-[200px]"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className={`absolute bottom-3 right-3 p-2 rounded-xl transition-all
                ${input.trim() ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
              `}
            >
              <ArrowUp size={20} />
            </button>
          </form>
          <div className="text-[10px] text-gray-400 text-center mt-3">
            Lumina is powered by Gemini 3 Pro. It can make mistakes. Verify important info.
          </div>
        </div>
      </div>
    </div>
  );
};
