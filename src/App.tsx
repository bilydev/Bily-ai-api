import { useState, useEffect, useRef } from 'react';
import { Menu, AlertCircle } from 'lucide-react';
import LoginRegister from './components/LoginRegister';
import Sidebar, { ChatSession } from './components/Sidebar';
import ChatWindow, { Message } from './components/ChatWindow';
import InfoPage from './components/InfoPage';
import { playNotificationSound } from './utils/audio';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'chat' | 'info'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'zimage' | 'claude47' | 'gemini'>('claude47');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load current user from session / local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('bily_active_user');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // Load sessions when user changes
  useEffect(() => {
    if (currentUser) {
      const allSessions: ChatSession[] = JSON.parse(localStorage.getItem('bily_sessions') || '[]');
      // Filter sessions belonging to this user
      const userSessions = allSessions.filter(s => s.username === currentUser.toLowerCase());
      setSessions(userSessions);

      // Start fresh automatically (new chat screen) for better user experience
      setActiveSessionId(null);
      setMessages([]);
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [currentUser]);

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      const savedMsgs = localStorage.getItem(`bily_messages_${activeSessionId}`);
      if (savedMsgs) {
        setMessages(JSON.parse(savedMsgs));
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem('bily_active_user', username);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('bily_active_user');
    setCurrentUser(null);
    setCurrentPage('chat');
  };

  const handleNewSession = () => {
    if (!currentUser) return;

    const newSession: ChatSession = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      username: currentUser.toLowerCase(),
      title: 'Obrolan Baru ' + (sessions.length + 1),
      createdAt: new Date().toISOString()
    };

    // Save globally
    const allSessions = JSON.parse(localStorage.getItem('bily_sessions') || '[]');
    allSessions.unshift(newSession);
    localStorage.setItem('bily_sessions', JSON.stringify(allSessions));

    // Update active user's sessions
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    const allSessions: ChatSession[] = JSON.parse(localStorage.getItem('bily_sessions') || '[]');
    const updated = allSessions.map(s => {
      if (s.id === id) {
        return { ...s, title: newTitle };
      }
      return s;
    });
    localStorage.setItem('bily_sessions', JSON.stringify(updated));

    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleDeleteSession = (id: string) => {
    // Delete session from list
    const allSessions: ChatSession[] = JSON.parse(localStorage.getItem('bily_sessions') || '[]');
    const filtered = allSessions.filter(s => s.id !== id);
    localStorage.setItem('bily_sessions', JSON.stringify(filtered));

    // Delete messages
    localStorage.removeItem(`bily_messages_${id}`);

    setSessions(prev => prev.filter(s => s.id !== id));

    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        setActiveSessionId(null);
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser) return;

    let targetSessionId = activeSessionId;
    let currentSessions = [...sessions];

    // Create session automatically if there are none
    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        username: currentUser.toLowerCase(),
        title: content.trim().substring(0, 24) || 'Obrolan Baru',
        createdAt: new Date().toISOString()
      };

      const allSessions = JSON.parse(localStorage.getItem('bily_sessions') || '[]');
      allSessions.unshift(newSession);
      localStorage.setItem('bily_sessions', JSON.stringify(allSessions));

      currentSessions = [newSession, ...currentSessions];
      setSessions(currentSessions);
      targetSessionId = newSession.id;
      setActiveSessionId(newSession.id);
    }

    const timestampStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content,
      timestamp: timestampStr
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`bily_messages_${targetSessionId}`, JSON.stringify(updatedMessages));

    // Auto-rename chat from first message if it was named "Obrolan Baru ..."
    const currentSession = currentSessions.find(s => s.id === targetSessionId);
    if (currentSession && currentSession.title.startsWith('Obrolan Baru')) {
      const generatedTitle = content.trim().substring(0, 24) || 'Analisis Kode';
      handleRenameSession(targetSessionId, generatedTitle);
    }

    // Call API
    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let replyText = '';

      // Set up compiled context prompt
      let fullPrompt = content;

      if (aiMode === 'zimage') {
        // LexCode Foto AI Generator API - Passing multiple fallback parameters for maximum reliability
        const response = await fetch(`https://api.lexcode.biz.id/api/ai/zimage?text=${encodeURIComponent(fullPrompt)}&prompt=${encodeURIComponent(fullPrompt)}&pesan=${encodeURIComponent(fullPrompt)}`, {
          method: "GET",
          signal: controller.signal
        });

        const raw = await response.text();

        if (!response.ok) {
          console.error("ZIMAGE STATUS :", response.status);
          console.error("ZIMAGE BODY :", raw);
          throw new Error(`STATUS: ${response.status} - ${raw}`);
        }

        // Safely parse JSON
        try {
          const data = JSON.parse(raw);
          // Target exact structure: data.result.image
          replyText = (data.result && typeof data.result === 'object' ? data.result.image : null) 
            || data.result 
            || raw;
        } catch (jsonErr) {
          replyText = raw || "Maaf, respons dari ZImage AI kosong.";
        }

      } else if (aiMode === 'gemini') {
        // LexCode Gemini 3 Pro Preview API - Passing multiple fallback parameters for maximum reliability
        const response = await fetch(`https://api.lexcode.biz.id/api/ai/gemini/3-pro-preview?text=${encodeURIComponent(fullPrompt)}&prompt=${encodeURIComponent(fullPrompt)}&pesan=${encodeURIComponent(fullPrompt)}`, {
          method: "GET",
          signal: controller.signal
        });

        const raw = await response.text();

        if (!response.ok) {
          console.error("GEMINI STATUS :", response.status);
          console.error("GEMINI BODY :", raw);
          throw new Error(`STATUS: ${response.status} - ${raw}`);
        }

        // Safely parse JSON
        try {
          const data = JSON.parse(raw);
          // Target exact structure: data.result
          replyText = data.result || raw;
        } catch (jsonErr) {
          replyText = raw || "Maaf, respons dari Gemini AI kosong.";
        }

      } else {
        // LexCode Claude 4.7 API integration - Passing multiple parameters for maximum compatibility
        // Format: https://api.lexcode.biz.id/api/ai/claude/4-7-opus?text=<text_prompt>
        const response = await fetch(`https://api.lexcode.biz.id/api/ai/claude/4-7-opus?text=${encodeURIComponent(fullPrompt)}&prompt=${encodeURIComponent(fullPrompt)}&pesan=${encodeURIComponent(fullPrompt)}`, {
          method: "GET",
          signal: controller.signal
        });

        const raw = await response.text();

        if (!response.ok) {
          console.error("CLAUDE 4.7 STATUS :", response.status);
          console.error("CLAUDE 4.7 BODY :", raw);
          throw new Error(`STATUS: ${response.status} - ${raw}`);
        }

        // Safely parse JSON or fallback to raw response
        try {
          const data = JSON.parse(raw);
          // Target exact structure: data.result as requested
          replyText = data.result || raw;
        } catch (jsonErr) {
          replyText = raw || "Maaf, respons dari Claude 4.7 kosong.";
        }
      }

      const assistantMessage: Message = {
        id: 'msg_assistant_' + Date.now(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      localStorage.setItem(`bily_messages_${targetSessionId}`, JSON.stringify(finalMessages));
      playNotificationSound('message');

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("User aborted/paused the AI generation.");
        return;
      }
      console.error(err);
      
      // Custom user-requested error message fallback
      const errorMessage: Message = {
        id: 'msg_error_' + Date.now(),
        role: 'assistant',
        content: `Error Terjadi: silakan hapus chat histori dan klik pilihan mode ai lain`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      localStorage.setItem(`bily_messages_${targetSessionId}`, JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };



  const handleCancelMessage = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    
    // Stop and discard the AI response instantly ("pesan dari ai jadi berhenti dan hilang gitu")
    // Keep only user message history
    setMessages(prev => {
      const filtered = prev.filter(m => m.role === 'user');
      if (activeSessionId) {
        localStorage.setItem(`bily_messages_${activeSessionId}`, JSON.stringify(filtered));
      }
      return filtered;
    });
  };

  // If not logged in, render authentication page
  if (!currentUser) {
    return <LoginRegister onLoginSuccess={handleLoginSuccess} />;
  }

  // If page is 'info', render about program page
  if (currentPage === 'info') {
    return <InfoPage onBack={() => setCurrentPage('chat')} />;
  }

  return (
    <div className="flex h-screen bg-[#FAF6F0] overflow-hidden selection:bg-[#4E2C0E] selection:text-white">
      
      {/* Custom Global Style for Animated Shimmer and Pulse */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #4E2C0E, #8B5A2B, #D4AF37, #8B5A2B, #4E2C0E);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 5s linear infinite;
        }
      `}</style>

      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        username={currentUser}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar with beautiful design */}
         <header className="h-16 border-b border-[#4E2C0E]/45 bg-white px-4 md:px-6 flex items-center justify-between shadow-[0_2px_4px_rgba(78,44,14,0.05)] shrink-0 z-10">
          
          {/* Hamburger toggle (mobile/tablet) */}
          <button
            onClick={() => {
              playNotificationSound('click');
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className="p-2 border border-[#4E2C0E]/45 rounded-xl hover:bg-[#FAF6F0] active:translate-y-0.5 text-[#4E2C0E] transition-all bg-white shadow-[2px_2px_0px_rgba(78,44,14,0.15)]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Golden/Chocolate shimmering developer name in middle */}
          <div className="flex flex-col items-center justify-center">
            <span className="shimmer-text text-sm md:text-base font-extrabold tracking-widest text-center select-none uppercase">
              bily enginer dev
            </span>
            <span className="text-[9px] text-[#4E2C0E]/40 font-bold uppercase tracking-widest">
              Premium Assistant
            </span>
          </div>

          {/* Info Exclamation Button */}
          <button
            onClick={() => {
              playNotificationSound('click');
              setCurrentPage('info');
            }}
            className="p-2 border border-[#4E2C0E]/45 rounded-xl hover:bg-[#FAF6F0] active:translate-y-0.5 text-[#4E2C0E] transition-all bg-white shadow-[2px_2px_0px_rgba(78,44,14,0.15)] flex items-center justify-center"
            title="Tentang Bily AI"
          >
            <AlertCircle className="w-5 h-5" />
          </button>

        </header>

        {/* Dynamic chat viewport */}
        <div className="flex-1 min-h-0">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onCancelMessage={handleCancelMessage}
            username={currentUser || "User"}
            aiMode={aiMode}
            onSetAiMode={setAiMode}
          />
        </div>

      </div>

    </div>
  );
}
