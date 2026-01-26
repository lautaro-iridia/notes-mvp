import { useState, FormEvent } from 'react';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email,
        password,
        display_name: displayName || undefined,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        setError(axiosError.response?.data?.detail || 'Error al registrarse');
      } else {
        setError('Error al registrarse');
      }
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
          Crear cuenta
        </h2>
        <p className={cn(
          "text-sm font-body mt-1",
          isDark ? "text-iridia-lavender/60" : "text-iridia-indigo/50"
        )}>
          Comienza a capturar tus ideas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            htmlFor="displayName"
            className={cn(
              "block text-sm font-display font-medium",
              isDark ? "text-iridia-lavender/80" : "text-iridia-indigo/70"
            )}
          >
            Nombre <span className={isDark ? "text-iridia-lavender/40" : "text-iridia-indigo/40"}>(opcional)</span>
          </label>
          <div className="relative group">
            <User className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              isDark
                ? "text-iridia-lavender/40 group-focus-within:text-iridia-orange"
                : "text-iridia-indigo/40 group-focus-within:text-iridia-orange"
            )} />
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="glass-input w-full pl-12 pr-4"
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>
        </div>

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
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className={cn(
              "block text-sm font-display font-medium",
              isDark ? "text-iridia-lavender/80" : "text-iridia-indigo/70"
            )}
          >
            Confirmar contraseña
          </label>
          <div className="relative group">
            <Lock className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              isDark
                ? "text-iridia-lavender/40 group-focus-within:text-iridia-orange"
                : "text-iridia-indigo/40 group-focus-within:text-iridia-orange"
            )} />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="glass-input w-full pl-12 pr-4"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3.5 px-6 rounded-xl font-display font-semibold mt-6",
            "flex items-center justify-center gap-2",
            "transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-iridia-orange text-iridia-black",
            "hover:bg-iridia-orange-light",
            "hover:shadow-lg hover:shadow-iridia-orange/30",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creando cuenta...</span>
            </>
          ) : (
            <>
              <span>Crear cuenta</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className={cn(
          "text-sm font-body",
          isDark ? "text-iridia-lavender/60" : "text-iridia-indigo/50"
        )}>
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className={cn(
              "font-display font-semibold transition-colors",
              "text-iridia-orange hover:text-iridia-orange-light"
            )}
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
