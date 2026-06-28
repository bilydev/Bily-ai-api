import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, RefreshCw, X, Copy, Check, Eye, Terminal, FileText
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

export interface AttachmentItem {
  id: string;
  name: string;
  type: string;
  base64?: string;
  size: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fileAttachments?: AttachmentItem[];
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onCancelMessage: () => void;
  username: string;
  aiMode: 'zimage' | 'claude47' | 'gemini';
  onSetAiMode: (mode: 'zimage' | 'claude47' | 'gemini') => void;
}

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  onCancelMessage,
  username,
  aiMode,
  onSetAiMode
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<string>('');
  
  // Downward drag to close modal state tracker
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragStart = (clientY: number) => {
    setDragStartY(clientY);
    setIsDragging(true);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging || dragStartY === null) return;
    const offset = clientY - dragStartY;
    // Allow dragging downwards only
    if (offset > 0) {
      setDragOffsetY(offset);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartY(null);
    // If dragged down past threshold (140px), close modal
    if (dragOffsetY > 140) {
      setPreviewCode(null);
      playNotificationSound('click');
    }
    setDragOffsetY(0);
  };
  
  // Custom looping typewriter state
  const [typewriterText, setTypewriterText] = useState('');
  const fullText = 'ai bily siap membantu anda';

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let intervalId: any;

    const tick = () => {
      if (!isDeleting) {
        setTypewriterText(fullText.substring(0, index + 1));
        index++;
        if (index === fullText.length) {
          // Pause at the end before deleting
          clearInterval(intervalId);
          setTimeout(() => {
            isDeleting = true;
            intervalId = setInterval(tick, 60);
          }, 2000);
        }
      } else {
        setTypewriterText(fullText.substring(0, index - 1));
        index--;
        if (index === 0) {
          isDeleting = false;
          clearInterval(intervalId);
          setTimeout(() => {
            intervalId = setInterval(tick, 120);
          }, 500);
        }
      }
    };

    intervalId = setInterval(tick, 120);
    return () => clearInterval(intervalId);
  }, []);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(blockId);
    playNotificationSound('success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePreviewCode = (code: string, lang: string) => {
    playNotificationSound('click');
    setPreviewCode(code);
    setPreviewLanguage(lang);
  };

  // Direct in-browser instant blob download tool
  const triggerInstantDownload = async (imageUrl: string) => {
    try {
      playNotificationSound('success');
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = localUrl;
      link.download = `bily_ai_photo_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up local URL reference
      setTimeout(() => URL.revokeObjectURL(localUrl), 100);
    } catch (err) {
      console.error("Direct blob download failed, fallback to direct window open.", err);
      window.open(imageUrl, '_blank');
    }
  };

  // Beautiful parsing of code vs plain text or generated Image outputs
  const renderMessageContent = (content: string, messageId: string) => {
    const trimmed = content.trim();
    const isImageResponse = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.endsWith('.png') || trimmed.endsWith('.jpg') || trimmed.endsWith('.jpeg') || trimmed.endsWith('.webp') || trimmed.includes('/api/ai/zimage') || trimmed.includes('lexcode.biz.id/result/image');

    if (isImageResponse) {
      return (
        <div className="my-3 border border-[#4E2C0E]/45 bg-white rounded-2xl overflow-hidden shadow-md max-w-sm flex flex-col">
          {/* Output image frame with Click-to-Download link wrapper */}
          <a 
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Intercept normal tab open to trigger immediate browser blob download
              e.preventDefault();
              triggerInstantDownload(trimmed);
            }}
            className="relative group overflow-hidden bg-black/5 flex items-center justify-center min-h-[220px] cursor-pointer"
            title="Tekan untuk unduh gambar"
          >
            <img 
              src={trimmed} 
              alt="AI Generated Output" 
              className="w-full h-auto object-cover max-h-[340px] transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </a>
          
          {/* Action Footer: Thinned and simplified with custom text caption underneath and no buttons */}
          <div className="p-3 bg-[#FAF6F0]/40 flex items-center justify-center border-t border-[#4E2C0E]/10 select-none">
            <span className="text-[10px] text-[#4E2C0E] font-black uppercase tracking-widest text-center animate-pulse flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>tekan dan download gambar</span>
            </span>
          </div>
        </div>
      );
    }

    // Matches markdown code blocks: ```lang code ```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Push text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'code',
        code: match[2],
        id: `${messageId}-${match.index}`
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    return (
      <div className="space-y-4">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            const isHTMLPlayable = part.language ? ['html', 'xml', 'svg', 'javascript', 'js', 'css'].includes(part.language.toLowerCase()) : false;
            
            return (
              <div 
                key={part.id || idx} 
                className="my-3 border border-[#4E2C0E]/45 rounded-xl overflow-hidden bg-[#2D1B0C] shadow-[4px_4px_0px_rgba(78,44,14,0.15)] max-w-full"
              >
                {/* Header bar of code snippet */}
                <div className="bg-[#4E2C0E] px-4 py-2 flex items-center justify-between border-b border-[#4E2C0E]/50 text-white">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      {part.language || 'code'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Live Preview Button */}
                    {isHTMLPlayable && (
                      <button
                        onClick={() => handlePreviewCode(part.code || '', part.language || '')}
                        className="px-2.5 py-1 bg-[#8B5A2B] hover:bg-[#5C3A21] rounded-md text-[10px] font-bold tracking-wider flex items-center gap-1 transition-all"
                        title="Lihat Preview Live"
                      >
                        <Eye className="w-3 h-3" />
                        <span>PREVIEW</span>
                      </button>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyCode(part.code || '', part.id || '')}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[10px] font-bold tracking-wider flex items-center gap-1 transition-all"
                      title="Salin Kode"
                    >
                      {copiedId === part.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">SALIN!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>SALIN</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Code viewport */}
                <div className="p-4 overflow-x-auto font-mono text-xs text-[#FAF6F0] leading-relaxed select-text selection:bg-amber-900">
                  <pre className="whitespace-pre">{part.code}</pre>
                </div>
              </div>
            );
          } else {
            // Normal Text: Render formatted markdown-like or clean lines
            return (
              <p key={idx} className="text-sm font-medium text-[#4E2C0E] leading-relaxed whitespace-pre-wrap select-text">
                {part.content}
              </p>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFBF9] selection:bg-[#4E2C0E] selection:text-white">
      {/* Scrollable message screen */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        
        {messages.length === 0 ? (
          /* Landing/Empty State screen */
          <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto py-12">
            
            {/* Elegant borderless typewriter animation container */}
            <div className="flex flex-col items-center mb-12">
              <div className="text-center min-w-[280px] sm:min-w-[340px] relative">
                {/* Flat borderless typography layout with adjacent sequential circular bullet */}
                <div className="text-xl sm:text-2xl font-black text-[#4E2C0E] tracking-wide inline-flex items-center gap-2 justify-center">
                  <span className="font-mono select-none">{typewriterText}</span>
                  {/* Glowing, bouncing sequential bullet dot tracking the text flow */}
                  <span className="w-3.5 h-3.5 rounded-full bg-[#8B5A2B] animate-bounce shrink-0 inline-block shadow-sm" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-[#4E2C0E] tracking-tight">
                Hai, selamat datang di AI Bily!
              </h2>
              <p className="text-sm text-[#4E2C0E]/80 leading-relaxed font-semibold">
                Pilih mode asisten AI Anda di bawah ini. Kami akan menjawab dengan cepat dan tepat untuk Anda.
              </p>
            </div>

            {/* Mode AI Selector (Foto AI vs Claude 4.7 vs Gemini 3) */}
            <div className="w-full mt-8 bg-white border border-[#4E2C0E]/45 p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-xs">
              
              {/* Foto AI on Left */}
              <button 
                type="button"
                onClick={() => {
                  playNotificationSound('success');
                  onSetAiMode('zimage');
                }}
                className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black tracking-wider transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 ${
                  aiMode === 'zimage'
                    ? 'bg-[#4E2C0E] text-white shadow-sm font-extrabold animate-pulse'
                    : 'bg-transparent text-[#4E2C0E]/60 hover:text-[#4E2C0E] hover:bg-[#FAF6F0]'
                }`}
              >
                <span>📷 FOTO AI</span>
              </button>

              <div className="w-px h-5 bg-[#4E2C0E]/15" />

              {/* Claude 4.7 in Center */}
              <button 
                type="button"
                onClick={() => {
                  playNotificationSound('success');
                  onSetAiMode('claude47');
                }}
                className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black tracking-wider transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 ${
                  aiMode === 'claude47'
                    ? 'bg-[#4E2C0E] text-white shadow-sm font-extrabold animate-pulse'
                    : 'bg-transparent text-[#4E2C0E]/60 hover:text-[#4E2C0E] hover:bg-[#FAF6F0]'
                }`}
              >
                <span>⚡ CLAUDE 4.7</span>
              </button>

              <div className="w-px h-5 bg-[#4E2C0E]/15" />

              {/* Gemini 3 on Right */}
              <button 
                type="button"
                onClick={() => {
                  playNotificationSound('success');
                  onSetAiMode('gemini');
                }}
                className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black tracking-wider transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 ${
                  aiMode === 'gemini'
                    ? 'bg-[#4E2C0E] text-white shadow-sm font-extrabold animate-pulse'
                    : 'bg-transparent text-[#4E2C0E]/60 hover:text-[#4E2C0E] hover:bg-[#FAF6F0]'
                }`}
              >
                <span>✨ GEMINI 3</span>
              </button>
            </div>

          </div>
        ) : (
          /* Active chat thread */
          <div className="space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 md:gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar bubble - user is shown as uppercase first letter of their username */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs shadow-md border ${
                    isUser 
                      ? 'bg-white border-[#4E2C0E] text-[#4E2C0E]' 
                      : 'bg-[#4E2C0E] border-[#4E2C0E] text-[#FAF6F0]'
                  }`}>
                    {isUser ? (username.charAt(0).toUpperCase() || 'U') : 'B'}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="space-y-1.5 max-w-[85%] w-full">
                    <div className={`flex items-center gap-2 ${isUser ? 'justify-end text-right' : 'justify-start'}`}>
                      {isUser ? (
                        <>
                          <span className="text-[9px] text-[#4E2C0E]/30 font-bold">
                            {msg.timestamp}
                          </span>
                          <span className="text-[10px] font-black uppercase text-[#4E2C0E]/50 tracking-wider">
                            Anda
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-black uppercase text-[#4E2C0E]/50 tracking-wider">
                            BILY AI
                          </span>
                          <span className="text-[9px] text-[#4E2C0E]/30 font-bold">
                            {msg.timestamp}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Multiple attachments preview inside message bubble */}
                    {msg.fileAttachments && msg.fileAttachments.length > 0 && (
                      <div className="space-y-1.5 mb-2.5 max-w-md">
                        {msg.fileAttachments.map((file) => (
                          <div key={file.id} className="p-2 bg-[#FAF6F0] border border-[#4E2C0E]/20 rounded-xl flex items-center gap-3">
                            {file.type.startsWith('image/') ? (
                              <img 
                                src={file.base64} 
                                alt={file.name} 
                                className="w-12 h-12 object-cover rounded-lg border border-[#4E2C0E]/10"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-800">
                                <FileText className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#4E2C0E] truncate">{file.name}</p>
                              <span className="text-[10px] text-[#4E2C0E]/50 font-semibold">{file.size}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actual Response Render (Plain text vs custom code block styling) */}
                    <div className="leading-relaxed">
                      {renderMessageContent(msg.content, msg.id)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated generation loading animation */}
            {isLoading && (
              <div className="flex gap-3 md:gap-4 mr-auto max-w-3xl animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-[#4E2C0E] text-[#FAF6F0] flex items-center justify-center font-black text-xs shrink-0 border border-[#4E2C0E]">
                  B
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#4E2C0E]/50 tracking-widest block">
                    {aiMode === 'zimage' ? 'Bily AI sedang memuat gambar dengan bagus...' : 'Bily AI sedang mengetik...'}
                  </span>
                  {/* Beautiful big, bouncing, chocolate spheres sliding up/down */}
                  <div className="flex items-center gap-3 p-4 bg-[#FAF6F0] border border-[#4E2C0E]/25 rounded-2xl w-32 justify-center shadow-sm">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#4E2C0E] animate-bounce [animation-delay:-0.3s] shadow-md"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#8B5A2B] animate-bounce [animation-delay:-0.15s] shadow-md"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#D4AF37] animate-bounce shadow-md"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>
        )}

      </div>

      {/* Input Message Form area */}
      <div className="p-4 md:p-6 bg-white border-t-2 border-[#4E2C0E] shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-stretch gap-3">
          
          {/* Text input - layout secured with overflow bounds & broadened to fill space perfectly */}
          <div className="flex-1 relative flex items-center min-w-0">
            <input
              type="text"
              placeholder="Tanyakan kode atau materi belajar Anda..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3.5 border border-[#4E2C0E]/45 rounded-xl bg-white text-sm font-bold text-[#4E2C0E] outline-none shadow-[2px_2px_0px_rgba(78,44,14,0.15)] focus:shadow-[4px_4px_0px_rgba(78,44,14,0.15)] transition-all placeholder:text-[#4E2C0E]/40"
            />
          </div>

          {/* Interactive controls: Combined SEND / PAUSE button */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* SEND / PAUSE button */}
            {isLoading ? (
              /* If loading: Render PAUSE button instead */
              <button
                type="button"
                onClick={() => {
                  playNotificationSound('click');
                  onCancelMessage();
                }}
                className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-[2px_2px_0px_rgba(78,44,14,0.15)] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 border border-[#4E2C0E]/45 animate-pulse"
                title="Pause AI generation"
              >
                <X className="w-4 h-4 font-black" />
                <span className="hidden sm:inline text-xs tracking-wider uppercase">Pause</span>
              </button>
            ) : (
              /* If normal: Render SEND button */
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-3.5 bg-[#4E2C0E] hover:bg-[#5C3A21] disabled:opacity-50 text-white rounded-xl font-bold shadow-[2px_2px_0px_rgba(78,44,14,0.15)] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 border border-[#4E2C0E]/45"
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs tracking-wider uppercase">Kirim</span>
              </button>
            )}
          </div>

        </form>
      </div>

      {/* LIVE CODE INTERACTIVE PLAYGROUND MODAL PREVIEW */}
      {previewCode !== null && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-150"
          onMouseMove={(e) => handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              handleDragMove(e.touches[0].clientY);
            }
          }}
          onTouchEnd={handleDragEnd}
        >
          <div 
            className="w-full max-w-4xl bg-[#FAF6F0] border border-[#4E2C0E]/45 rounded-2xl overflow-hidden shadow-[8px_8px_0px_rgba(78,44,14,0.25)] flex flex-col h-[85vh] transition-transform duration-100"
            style={{
              transform: `translateY(${dragOffsetY}px)`
            }}
          >
            {/* Top Drag to Close Visual Indicator Bar */}
            <div 
              className="w-full py-1.5 bg-[#4E2C0E]/10 hover:bg-[#4E2C0E]/15 flex justify-center items-center cursor-row-resize select-none border-b border-[#4E2C0E]/10 shrink-0"
              onMouseDown={(e) => handleDragStart(e.clientY)}
              onTouchStart={(e) => {
                if (e.touches[0]) {
                  handleDragStart(e.touches[0].clientY);
                }
              }}
              title="Seret ke bawah untuk menutup"
            >
              <div className="w-16 h-1 rounded-full bg-[#4E2C0E]/40" />
            </div>

            {/* Modal header */}
            <div className="bg-[#4E2C0E] text-white p-4 flex items-center justify-between border-b border-[#4E2C0E]/45 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-white text-[#4E2C0E] flex items-center justify-center text-xs font-black">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide">BILY LIVE PREVIEW SANDBOX</h3>
                  <p className="text-[10px] text-[#FAF6F0]/80">Output Render {previewLanguage.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewCode);
                    playNotificationSound('success');
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </button>

                <button
                  onClick={() => {
                    playNotificationSound('click');
                    setPreviewCode(null);
                  }}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sandbox full-screen iframe rendering panel (100% full view) */}
            <div className="flex-1 flex flex-col bg-white">
              
              <div className="bg-[#FAF6F0] border-b border-[#4E2C0E]/10 p-2.5 px-4 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-[#4E2C0E]/70 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  Live Preview Output (Full View)
                </span>
                
                {/* Reload iframe */}
                <button
                  onClick={() => {
                    playNotificationSound('click');
                    const temp = previewCode;
                    setPreviewCode('');
                    setTimeout(() => setPreviewCode(temp), 50);
                  }}
                  className="p-1 hover:bg-[#FAF6F0] rounded-md border border-[#4E2C0E]/20 text-[#4E2C0E]"
                  title="Reload Preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 bg-white relative">
                {previewCode ? (
                  <iframe
                    srcDoc={previewCode}
                    title="Bily Sandbox Frame"
                    sandbox="allow-scripts"
                    className="w-full h-full border-none bg-white"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-[#4E2C0E]/40 font-bold">
                    Rendering preview...
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4E2C0E] ml-2" />
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
