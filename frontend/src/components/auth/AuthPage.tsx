import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';

// Iridia Labs Logo Component
function IridiaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Outer circle - eyeball */}
      <circle cx="50" cy="50" r="45" fill="#0D0E0E" stroke="#B2A5FF" strokeWidth="2"/>
      {/* Iris - indigo */}
      <circle cx="50" cy="50" r="30" fill="#4B0082"/>
      {/* Pupil */}
      <circle cx="50" cy="50" r="12" fill="#0D0E0E"/>
      {/* Highlight/brillo - orange */}
      <circle cx="62" cy="38" r="6" fill="#FF9B00"/>
    </svg>
  );
}

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { isDark } = useTheme();

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      isDark ? "bg-iridia-black" : "bg-iridia-cream"
    )}>
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-30",
        isDark
          ? "bg-gradient-to-br from-iridia-indigo/20 via-transparent to-iridia-lavender/10"
          : "bg-gradient-to-br from-iridia-indigo/5 via-transparent to-iridia-lavender/5"
      )} />

      {/* Floating orbs for ambient effect */}
      <div className={cn(
        "absolute top-1/4 -left-32 w-64 h-64 rounded-full blur-3xl animate-pulse",
        isDark ? "bg-iridia-indigo/20" : "bg-iridia-indigo/10"
      )} />
      <div className={cn(
        "absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl animate-pulse",
        isDark ? "bg-iridia-lavender/15" : "bg-iridia-lavender/10"
      )} style={{ animationDelay: '1s' }} />
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20",
        isDark ? "bg-iridia-orange/10" : "bg-iridia-orange/5"
      )} />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-10 animate-fade-in">
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6",
            "iridia-glow transition-transform duration-500 hover:scale-105"
          )}>
            <IridiaLogo className="w-full h-full" />
          </div>
          <h1 className={cn(
            "text-3xl font-display font-bold tracking-tight",
            isDark ? "text-iridia-cream" : "text-iridia-indigo"
          )}>
            Iridia <span className="text-iridia-orange">Notes</span>
          </h1>
          <p className={cn(
            "text-sm font-body mt-2",
            isDark ? "text-iridia-lavender/70" : "text-iridia-indigo/60"
          )}>
            Captura tus ideas, organiza tu mente
          </p>
        </div>

        {/* Glass card container */}
        <div className={cn(
          "glass-card p-8 animate-slide-up",
          "transition-all duration-500"
        )}>
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>

        {/* Footer */}
        <p className={cn(
          "text-center text-xs font-body mt-8 animate-fade-in",
          isDark ? "text-iridia-lavender/40" : "text-iridia-indigo/40"
        )} style={{ animationDelay: '0.3s' }}>
          Soluciones Inteligentes by <span className="font-semibold">Iridia Labs</span>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
