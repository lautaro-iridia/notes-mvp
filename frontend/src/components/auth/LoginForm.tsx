import { useState, FormEvent } from 'react';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, loginWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
      } catch {
        setError('Error al iniciar sesión con Google');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => setError('Error al iniciar sesión con Google'),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className={cn(
          "text-2xl font-display font-bold",
          isDark ? "text-iridia-cream" : "text-iridia-indigo"
        )}>
          Bienvenido
        </h2>
        <p className={cn(
          "text-sm font-body mt-1",
          isDark ? "text-iridia-lavender/60" : "text-iridia-indigo/50"
        )}>
          Inicia sesión para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl text-sm font-body",
            "bg-red-500/10 border border-red-500/20",
            isDark ? "text-red-400" : "text-red-600"
          )}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className={cn(
              "block text-sm font-display font-medium",
              isDark ? "text-iridia-lavender/80" : "text-iridia-indigo/70"
            )}
          >
            Correo electrónico
          </label>
          <div className="relative group">
            <Mail className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              isDark
                ? "text-iridia-lavender/40 group-focus-within:text-iridia-orange"
                : "text-iridia-indigo/40 group-focus-within:text-iridia-orange"
            )} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full pl-12 pr-4"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className={cn(
              "block text-sm font-display font-medium",
              isDark ? "text-iridia-lavender/80" : "text-iridia-indigo/70"
            )}
          >
            Contraseña
          </label>
          <div className="relative group">
            <Lock className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              isDark
                ? "text-iridia-lavender/40 group-focus-within:text-iridia-orange"
                : "text-iridia-indigo/40 group-focus-within:text-iridia-orange"
            )} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full pl-12 pr-4"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3.5 px-6 rounded-xl font-display font-semibold",
            "flex items-center justify-center gap-2",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-gradient-to-r from-iridia-indigo to-iridia-indigo-light",
            "text-iridia-cream",
            "hover:shadow-lg hover:shadow-iridia-indigo/30",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <>
              <span>Iniciar sesión</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className={cn(
          "flex items-center gap-3 my-2",
          isDark ? "text-iridia-lavender/30" : "text-iridia-indigo/30"
        )}>
          <div className="flex-1 h-px bg-current" />
          <span className={cn(
            "text-xs font-body",
            isDark ? "text-iridia-lavender/40" : "text-iridia-indigo/40"
          )}>o</span>
          <div className="flex-1 h-px bg-current" />
        </div>

        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={isGoogleLoading || isLoading}
          className={cn(
            "w-full py-3.5 px-6 rounded-xl font-display font-semibold",
            "flex items-center justify-center gap-3",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isDark
              ? "bg-white/10 border border-white/15 text-iridia-cream hover:bg-white/15"
              : "bg-white border border-iridia-indigo/15 text-iridia-indigo hover:bg-iridia-cream",
            "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>Continuar con Google</span>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className={cn(
          "text-sm font-body",
          isDark ? "text-iridia-lavender/60" : "text-iridia-indigo/50"
        )}>
          ¿No tienes cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className={cn(
              "font-display font-semibold transition-colors",
              "text-iridia-orange hover:text-iridia-orange-light"
            )}
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
