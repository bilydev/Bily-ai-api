import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

interface LoginRegisterProps {
  onLoginSuccess: (username: string) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getStoredUsers = (): Record<string, string> => {
    const users = localStorage.getItem('bily_users');
    return users ? JSON.parse(users) : {};
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password tidak boleh kosong.');
      return;
    }

    if (username.length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }

    if (password.length < 4) {
      setError('Password minimal 4 karakter.');
      return;
    }

    const users = getStoredUsers();
    if (users[username.toLowerCase()]) {
      setError('Username ini sudah terdaftar. Silakan login.');
      return;
    }

    // Save user
    users[username.toLowerCase()] = password;
    localStorage.setItem('bily_users', JSON.stringify(users));

    setSuccessMsg('akun terdaftar');
    playNotificationSound('success');
    
    // Auto shift to login and preserve username
    setTimeout(() => {
      setIsRegistering(false);
      setSuccessMsg('');
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi.');
      return;
    }

    const users = getStoredUsers();
    const savedPassword = users[username.toLowerCase()];

    // Hidden admin account with username 'b' and password 'b'
    if (username.toLowerCase() === 'b' && password === 'b') {
      // Allow admin login bypass
    } else if (!savedPassword || savedPassword !== password) {
      setError('Username atau password salah.');
      return;
    }

    // Success notification
    playNotificationSound('login');
    setSuccessMsg('login success wellcome');
    
    setTimeout(() => {
      onLoginSuccess(username);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4 selection:bg-[#4E2C0E] selection:text-[#FAF6F0] relative overflow-hidden">
      
      {/* Dynamic Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4e2c0e08_1px,transparent_1px),linear-gradient(to_bottom,#4e2c0e08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Subtle organic decorative background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#8B5A2B]/5 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#4E2C0E]/5 blur-3xl pointer-events-none animate-pulse delay-700" />

      {/* Main Card container with elegant, thin and subtle chocolate borders */}
      <div className="w-full max-w-xl bg-white border border-[#4E2C0E]/45 rounded-3xl overflow-hidden transition-all duration-300 relative z-10">
        
        {/* Header Banner - Highly styled gradient ribbon */}
        <div className="bg-[#4E2C0E] p-8 text-[#FAF6F0] text-center border-b border-[#4E2C0E]/45 relative overflow-hidden">
          {/* Internal diagonal stripes */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#5c3a21_25%,transparent_25%,transparent_50%,#5c3a21_50%,#5c3a21_75%,transparent_75%,transparent)] bg-[size:40px_40px] opacity-10 pointer-events-none" />
          
          <div className="inline-flex items-center justify-center p-3.5 bg-white border-2 border-[#FAF6F0]/20 rounded-2xl mb-4 text-[#4E2C0E] shadow-[4px_4px_0px_#8B5A2B]">
            <Sparkles className="w-7 h-7 text-[#8B5A2B] animate-pulse" />
          </div>
          
          {/* Forced single horizontal stretch title */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
            AI BILY ENGINER
          </h1>
          <p className="text-xs text-[#FAF6F0]/90 mt-3 font-semibold leading-relaxed max-w-sm mx-auto">
            AI cerdas serba bisa yang dibuat khusus untuk membantu Anda merancang berbagai macam kode pemrograman & menunjang aktivitas belajar Anda.
          </p>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#4E2C0E] text-center mb-6 flex items-center justify-center gap-2">
            {isRegistering ? (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Buat Akun Baru</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Masuk ke Akun</span>
              </>
            )}
          </h2>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {successMsg}
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4E2C0E] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Masukkan username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-[#4E2C0E]/30 focus:border-[#4E2C0E] focus:ring-2 focus:ring-[#4E2C0E]/10 rounded-xl bg-white text-sm text-[#4E2C0E] font-medium transition-all duration-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E2C0E] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 border border-[#4E2C0E]/30 focus:border-[#4E2C0E] focus:ring-2 focus:ring-[#4E2C0E]/10 rounded-xl bg-white text-sm text-[#4E2C0E] font-medium transition-all duration-200 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    playNotificationSound('click');
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4E2C0E]/60 hover:text-[#4E2C0E] transition-colors p-1"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#4E2C0E] text-[#FAF6F0] hover:bg-[#5C3A21] active:translate-y-0.5 rounded-xl font-bold text-sm tracking-wider shadow-md hover:shadow-lg active:shadow-sm transition-all duration-150 flex items-center justify-center gap-2 mt-2 border border-[#4E2C0E]"
            >
              {isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>DAFTAR SEKARANG</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>MASUK</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle login vs register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccessMsg('');
                playNotificationSound('click');
              }}
              className="text-xs text-[#4E2C0E]/75 hover:text-[#4E2C0E] font-bold underline decoration-dotted underline-offset-4 transition-colors"
            >
              {isRegistering 
                ? "Sudah punya akun? Masuk di sini" 
                : "Belum punya akun? Daftar gratis di sini"}
            </button>
          </div>
          


        </div>
      </div>
      
      {/* Footer copyright */}
      <p className="mt-8 text-xs text-[#4E2C0E]/50 font-semibold tracking-wider">
        © {new Date().getFullYear()} BILY ENGINEER DEV. All Rights Reserved.
      </p>
    </div>
  );
}
