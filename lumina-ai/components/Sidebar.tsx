
import React from 'react';
import { ChatThread } from '../types';
import { MessageSquare, Plus, Trash2, Menu, LayoutPanelLeft } from 'lucide-react';

interface SidebarProps {
  threads: ChatThread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  toggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  threads, 
  activeId, 
  onSelect, 
  onNew, 
  onDelete,
  isOpen,
  toggle 
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {!isOpen && (
        <button 
          onClick={toggle}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-sm border border-gray-200"
        >
          <Menu size={20} />
        </button>
      )}

      <aside className={`
        ${isOpen ? 'w-72' : 'w-0 overflow-hidden'} 
        transition-all duration-300 ease-in-out border-r border-gray-200 bg-[#f9f9f8] flex flex-col h-full z-40
      `}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg text-gray-800">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <span className="text-xs">L</span>
            </div>
            <span>Lumina AI</span>
          </div>
          <button onClick={toggle} className="p-1 hover:bg-gray-200 rounded text-gray-500">
            <LayoutPanelLeft size={18} />
          </button>
        </div>

        <button 
          onClick={onNew}
          className="mx-4 mt-2 mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <Plus size={16} />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Chats</div>
          {threads.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-gray-400 italic">No history yet</div>
          ) : (
            threads.map(thread => (
              <div 
                key={thread.id}
                onClick={() => onSelect(thread.id)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all
                  ${activeId === thread.id ? 'bg-[#e5e7eb] text-black font-medium' : 'text-gray-600 hover:bg-gray-200'}
                `}
              >
                <MessageSquare size={16} className={activeId === thread.id ? 'text-gray-900' : 'text-gray-400'} />
                <span className="flex-1 truncate">{thread.title}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(thread.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
              U
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Guest User</p>
              <p className="text-[10px] text-gray-500">Free Tier</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
