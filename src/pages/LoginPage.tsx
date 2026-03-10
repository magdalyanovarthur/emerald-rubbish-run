import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const LoginPage: React.FC = () => {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) navigate('/');
        else setError(result.error || 'Ошибка входа');
      } else {
        if (!name || !email || !phone || !password) {
          setError('Заполните все поля');
          setIsLoading(false);
          return;
        }
        const result = await register(name, email, phone, role, password);
        if (result.success && result.needsConfirmation) {
          setShowConfirmation(true);
        } else if (result.success) {
          navigate('/');
        } else {
          setError(result.error || 'Ошибка регистрации');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="ЧистоВынос" className="w-28 h-28 mb-4 drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-foreground">ЧистоВынос</h1>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Подтвердите email</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Мы отправили письмо на <span className="font-semibold text-foreground">{email}</span>. 
              Перейдите по ссылке в письме, чтобы активировать аккаунт.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Не получили письмо? Проверьте папку «Спам».
            </p>
            <button
              onClick={() => {
                setShowConfirmation(false);
                setIsLogin(true);
              }}
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
          <h1 className="text-2xl font-bold text-foreground">ЧистоВынос</h1>
          <p className="text-sm text-muted-foreground">Самара</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${isLogin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${!isLogin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Телефон"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${role === 'client' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                  >
                    Клиент
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('courier')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${role === 'courier' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                  >
                    Курьер
                  </button>
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-destructive text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
