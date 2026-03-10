import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <img src={logo} alt="ЧистоВынос" className="w-20 h-20 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Неверная ссылка для сброса пароля.</p>
          <button onClick={() => navigate('/login')} className="mt-4 text-primary text-sm font-medium">
            Вернуться ко входу
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="ЧистоВынос" className="w-28 h-28 mb-4 drop-shadow-lg" />
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Пароль изменён</h2>
            <p className="text-sm text-muted-foreground mb-6">Теперь вы можете войти с новым паролем.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
            >
              Перейти ко входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="ЧистоВынос" className="w-28 h-28 mb-4 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground">Новый пароль</h1>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Новый пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-destructive text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
