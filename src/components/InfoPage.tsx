
import { ArrowLeft, Sparkles, Code2, Zap, ShieldCheck, Heart } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

interface InfoPageProps {
  onBack: () => void;
}

export default function InfoPage({ onBack }: InfoPageProps) {
  const handleBackClick = () => {
    playNotificationSound('click');
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#4E2C0E] font-sans flex flex-col selection:bg-[#4E2C0E] selection:text-[#FAF6F0]">
      {/* Topbar */}
      <header className="border-b-2 border-[#4E2C0E] bg-white px-6 py-4 sticky top-0 flex items-center justify-between z-10 shadow-[0_2px_4px_rgba(78,44,14,0.05)]">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 px-3.5 py-1.5 border-2 border-[#4E2C0E] rounded-xl hover:bg-[#FAF6F0] active:translate-y-0.5 text-sm font-bold transition-all duration-150 shadow-[2px_2px_0px_rgba(78,44,14,0.15)] bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <span className="text-xs uppercase font-extrabold tracking-widest text-[#4E2C0E]/40">
          Tentang Program
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <div className="bg-white border-2 border-[#4E2C0E] rounded-2xl p-8 shadow-[6px_6px_0px_rgba(78,44,14,0.15)] relative overflow-hidden">
          
          {/* Aesthetic Background Shapes */}
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#FAF6F0] rounded-full opacity-60 border-2 border-[#4E2C0E]/10 pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-[#FAF6F0] border-2 border-[#4E2C0E] rounded-2xl shadow-[3px_3px_0px_rgba(78,44,14,0.1)] text-[#4E2C0E]">
              <Sparkles className="w-8 h-8 animate-pulse text-[#8B5A2B]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-wide text-[#4E2C0E]">
                BILY AI PROGRAM
              </h1>
              <p className="text-sm font-bold text-[#8B5A2B] uppercase tracking-widest">
                Selamat datang di AI Bily Enginer
              </p>
            </div>

            {/* Separator */}
            <div className="w-24 h-0.5 bg-[#4E2C0E]/20"></div>

            <p className="text-sm leading-relaxed text-[#4E2C0E]/95 max-w-lg">
              Asisten pintar serba bisa yang dirancang khusus untuk mempermudah pengerjaan coding, 
              menyelesaikan problem-solving matematika atau sains, hingga membantu pembelajaran Anda kapan saja secara gratis.
            </p>

            {/* Grid Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
              <div className="p-4 border border-[#4E2C0E]/20 rounded-xl bg-[#FAF6F0]/40 text-left">
                <div className="flex items-center gap-2 mb-2 font-bold text-[#4E2C0E]">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Respon Instan</span>
                </div>
                <p className="text-xs text-[#4E2C0E]/80 leading-relaxed">
                  Didukung model Claude 4.7 mutakhir, menyajikan jawaban super cepat tanpa menunggu lama.
                </p>
              </div>

              <div className="p-4 border border-[#4E2C0E]/20 rounded-xl bg-[#FAF6F0]/40 text-left">
                <div className="flex items-center gap-2 mb-2 font-bold text-[#4E2C0E]">
                  <Code2 className="w-4 h-4 text-amber-700" />
                  <span>Spesialis Coding</span>
                </div>
                <p className="text-xs text-[#4E2C0E]/80 leading-relaxed">
                  Membuat kode, mereview bug, hingga membuat layout web interaktif secara akurat.
                </p>
              </div>

              <div className="p-4 border border-[#4E2C0E]/20 rounded-xl bg-[#FAF6F0]/40 text-left">
                <div className="flex items-center gap-2 mb-2 font-bold text-[#4E2C0E]">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Aman & Terpercaya</span>
                </div>
                <p className="text-xs text-[#4E2C0E]/80 leading-relaxed">
                  Riwayat chat Anda tersimpan dengan aman pada akun lokal Anda untuk kemudahan akses.
                </p>
              </div>

              <div className="p-4 border border-[#4E2C0E]/20 rounded-xl bg-[#FAF6F0]/40 text-left">
                <div className="flex items-center gap-2 mb-2 font-bold text-[#4E2C0E]">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>Dukungan Premium</span>
                </div>
                <p className="text-xs text-[#4E2C0E]/80 leading-relaxed">
                  Hubungi kami secara langsung melalui fitur Report Bug jika Anda menemui masalah.
                </p>
              </div>
            </div>

            <button
              onClick={handleBackClick}
              className="mt-6 w-full py-3 bg-[#4E2C0E] text-[#FAF6F0] hover:bg-[#5C3A21] active:translate-y-0.5 rounded-xl font-bold text-sm tracking-wider shadow-[3px_3px_0px_rgba(78,44,14,0.15)] transition-all duration-150 border border-[#4E2C0E]"
            >
              MULAI BERKREASI SEKARANG
            </button>
          </div>

        </div>
      </main>

      {/* Mini footer */}
      <footer className="py-6 text-center border-t border-[#4E2C0E]/10">
        <p className="text-xs text-[#4E2C0E]/60 font-medium">
          Dibuat dengan sepenuh hati oleh BILY DEV © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
