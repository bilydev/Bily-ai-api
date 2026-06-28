import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Plus, Trash2, Edit2, LogOut, 
  Bug, User, MoreVertical, X, Check
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

export interface ChatSession {
  id: string;
  username: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  username,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onLogout
}: SidebarProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewChat = () => {
    playNotificationSound('click');
    onNewSession();
    onClose();
  };

  const handleSelectChat = (id: string) => {
    playNotificationSound('click');
    onSelectSession(id);
    onClose();
  };

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playNotificationSound('click');
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const startRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setActiveMenuId(null);
  };

  const saveRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
      playNotificationSound('success');
    }
    setEditingSessionId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playNotificationSound('click');
    onDeleteSession(id);
    setActiveMenuId(null);
  };

  // Generate customized WhatsApp Report Bug link
  const getWhatsAppLink = () => {
    const message = `Halo admin, saya ${username}. Saya ingin melaporkan bug di AI BILY ENGINER:\n\n[Tuliskan keterangan bug atau kendala Anda di sini]`;
    return `https://wa.me/6287892412411?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 bg-[#FAF6F0] border-r border-[#4E2C0E]/45 z-50 flex flex-col transform transition-transform duration-300 lg:static lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#4E2C0E]/45 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4E2C0E] text-white flex items-center justify-center font-black text-sm shadow-md">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest font-black text-[#4E2C0E]">Bily History</span>
              <span className="text-[10px] text-[#8B5A2B] font-bold">Workspace</span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 border border-[#4E2C0E]/20 hover:border-[#4E2C0E] hover:bg-[#FAF6F0] rounded-lg text-[#4E2C0E] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: Chat Baru */}
        <div className="p-4 bg-white border-b border-[#4E2C0E]/10">
          <button
            onClick={handleNewChat}
            className="w-full py-3 px-4 bg-white hover:bg-[#FAF6F0] border-2 border-[#4E2C0E] text-[#4E2C0E] font-bold text-sm rounded-xl shadow-[3px_3px_0px_rgba(78,44,14,0.15)] hover:shadow-[4px_4px_0px_rgba(78,44,14,0.2)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Chat Baru</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-[#4E2C0E]/40">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-xs font-bold">Belum ada riwayat chat</p>
              <p className="text-[10px] mt-1">Sesi baru akan otomatis dibuat setelah Anda mengirim pesan.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = activeSessionId === session.id;
              const isEditing = editingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => !isEditing && handleSelectChat(session.id)}
                  className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white border-[#4E2C0E] shadow-[2px_2px_0px_rgba(78,44,14,0.1)]' 
                      : 'bg-transparent border-transparent hover:bg-white/60 hover:border-[#4E2C0E]/20'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4E2C0E]' : 'text-[#4E2C0E]/50'}`} />
                  
                  {isEditing ? (
                    <form 
                      onSubmit={(e) => saveRename(e, session.id)}
                      className="flex-1 flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 border border-[#4E2C0E] rounded-md bg-white text-xs font-bold text-[#4E2C0E] outline-none"
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        className="p-1 border border-emerald-600 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingSessionId(null)}
                        className="p-1 border border-red-200 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-xs font-bold text-[#4E2C0E] truncate">
                        {session.title}
                      </p>
                      <span className="text-[9px] text-[#4E2C0E]/40 block font-semibold">
                        {new Date(session.createdAt).toLocaleDateString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Dropdown Action Trigger */}
                  {!isEditing && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        onClick={(e) => handleMenuToggle(e, session.id)}
                        className="p-1 rounded-md text-[#4E2C0E]/40 hover:text-[#4E2C0E] hover:bg-black/5 transition-all"
                        title="Opsi Riwayat"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Custom List Box (Dropdown Menu) */}
                      {activeMenuId === session.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 mt-1 w-32 bg-white border-2 border-[#4E2C0E] rounded-lg shadow-lg z-30 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => startRename(e, session)}
                            className="w-full px-3 py-2 text-left text-xs font-bold text-[#4E2C0E] hover:bg-[#FAF6F0] flex items-center gap-2 border-b border-[#4E2C0E]/10"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, session.id)}
                            className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 bg-white border-t border-[#4E2C0E]/45 space-y-3">
          
          {/* Report Bug */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playNotificationSound('click')}
            className="w-full py-2.5 px-3 border border-red-200 hover:border-red-400 bg-red-50/50 hover:bg-red-50 text-red-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Bug className="w-4 h-4" />
            <span>Report Bug (WhatsApp)</span>
          </a>

          {/* Profile & Logout Panel */}
          <div className="flex items-center justify-between p-2.5 bg-[#FAF6F0] border border-[#4E2C0E]/20 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#4E2C0E]/10 border border-[#4E2C0E]/30 flex items-center justify-center text-[#4E2C0E] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-[#4E2C0E] truncate">
                  {username}
                </p>
                <span className="text-[10px] text-emerald-600 font-extrabold block">
                  Online
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playNotificationSound('click');
                onLogout();
              }}
              className="p-1.5 border border-red-200 hover:border-red-400 bg-white hover:bg-red-50 rounded-lg text-red-600 transition-all shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
