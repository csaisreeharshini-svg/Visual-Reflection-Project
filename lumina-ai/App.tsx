
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ChatThread, Message } from './types';
import { sendMessageStream } from './services/geminiService';

const App: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load threads from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lumina_threads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
        if (parsed.length > 0) setActiveThreadId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse threads", e);
      }
    }
  }, []);

  // Save threads whenever they change
  useEffect(() => {
    localStorage.setItem('lumina_threads', JSON.stringify(threads));
  }, [threads]);

  const createNewThread = useCallback(() => {
    const newThread: ChatThread = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  }, []);

  const deleteThread = useCallback((id: string) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeThreadId === id) {
      setActiveThreadId(null);
    }
  }, [activeThreadId]);

  const activeThread = threads.find(t => t.id === activeThreadId) || null;

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId) {
      const newId = crypto.randomUUID();
      const newThread: ChatThread = {
        id: newId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        updatedAt: Date.now(),
      };
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newId);
      // Wait for state to update? Actually, we can just use the local variables
      processMessage(newThread, content);
    } else if (activeThread) {
      processMessage(activeThread, content);
    }
  };

  const processMessage = async (thread: ChatThread, content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    // Update UI with user message immediately
    const updatedMessages = [...thread.messages, userMessage, assistantMessage];
    
    setThreads(prev => prev.map(t => 
      t.id === thread.id 
        ? { 
            ...t, 
            messages: updatedMessages, 
            updatedAt: Date.now(),
            title: t.messages.length === 0 ? content.slice(0, 40) + (content.length > 40 ? '...' : '') : t.title
          } 
        : t
    ));

    try {
      let accumulatedContent = '';
      const stream = sendMessageStream([...thread.messages, userMessage]);

      for await (const chunk of stream) {
        accumulatedContent += chunk;
        setThreads(prev => prev.map(t => 
          t.id === thread.id 
            ? { 
                ...t, 
                messages: t.messages.map(m => 
                  m.id === assistantMessage.id ? { ...m, content: accumulatedContent } : m
                ) 
              } 
            : t
        ));
      }
    } catch (error) {
      setThreads(prev => prev.map(t => 
        t.id === thread.id 
          ? { 
              ...t, 
              messages: t.messages.map(m => 
                m.id === assistantMessage.id ? { ...m, content: "I encountered an error. Please check your connection." } : m
              ) 
            } 
          : t
      ));
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-gray-900">
      <Sidebar 
        threads={threads} 
        activeId={activeThreadId} 
        onSelect={setActiveThreadId} 
        onNew={createNewThread} 
        onDelete={deleteThread}
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
        <ChatView 
          thread={activeThread} 
          onSendMessage={handleSendMessage} 
          onNewChat={createNewThread}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </main>
    </div>
  );
};

export default App;
