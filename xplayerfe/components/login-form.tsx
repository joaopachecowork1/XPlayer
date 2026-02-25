"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const { loginGoogle, isLogged, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLogged) {
      router.replace("/dashboard");
    }
  }, [isLogged, router]);

  if (isLogged) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0e27]">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600 rounded-full blur-[120px] opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Title area */}
          <div className="mb-8 text-center">
            <h1 
              className="text-6xl font-black tracking-tighter mb-3"
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 80px rgba(168, 85, 247, 0.5)',
              }}
            >
              XPlayer
            </h1>
            <p className="text-slate-400 text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
              Track. Play. Compete.
            </p>
          </div>

          {/* Login card */}
          <div 
            className="relative backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              boxShadow: '0 0 100px rgba(139, 92, 246, 0.2), inset 0 0 60px rgba(139, 92, 246, 0.05)'
            }}
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-violet-500/50 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-blue-500/50 rounded-br-2xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Bem-vindo de volta
              </h2>
              <p className="text-slate-400 mb-8">
                Faz login para continuar a tua jornada gaming
              </p>

              {/* Google login button */}
              <button
                onClick={() => loginGoogle()}
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-white p-4 font-semibold text-slate-900 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: '0 0 40px rgba(255, 255, 255, 0.1)',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                {/* Animated shimmer effect */}
                <div 
                  className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                  }}
                />
                
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>A carregar...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Continuar com Google</span>
                    </>
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#0f172a]/80 px-4 text-slate-500">Primeira vez aqui?</span>
                </div>
              </div>

              {/* Info text */}
              <p className="text-center text-sm text-slate-400">
                Ao fazer login, concordas com os nossos{' '}
                <a href="#" className="text-violet-400 hover:text-violet-300 underline">termos de serviço</a>
                {' '}e{' '}
                <a href="#" className="text-violet-400 hover:text-violet-300 underline">política de privacidade</a>
              </p>
            </div>
          </div>

          {/* Footer stats/features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Jogadores', value: '10K+' },
              { label: 'Jogos', value: '50K+' },
              { label: 'Sessões', value: '100K+' }
            ].map((stat, i) => (
              <div 
                key={i}
                className="rounded-xl p-4 backdrop-blur-sm border border-white/5"
                style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  animation: `fadeInUp 0.6s ease-out ${i * 0.1}s both`
                }}
              >
                <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(60px, 60px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export function LoginButton() {
  return (
    <Button asChild className="bg-violet-600 hover:bg-violet-700">
      <Link href="/login">Iniciar Sessão</Link>
    </Button>
  );
}

export function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Button variant="outline" onClick={() => logout()}>
      Logout
    </Button>
  );
}