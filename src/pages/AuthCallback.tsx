import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'show-open-app' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  const isNative = typeof (window as any).Capacitor !== 'undefined';

  const isMobileBrowser = () => {
    const ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod|Android/i.test(ua);
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        // If inside Capacitor, set session and redirect
        if (isNative) {
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              setErrorMsg(error.message);
              setStatus('error');
              return;
            }
          }

          if (type === 'recovery') {
            navigate('/reset-password', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
          return;
        }

        // Mobile browser: show "Open in app" button WITHOUT setting session
        // (setting session triggers onAuthStateChange which causes redirect)
        if (isMobileBrowser()) {
          setStatus('show-open-app');
          return;
        }

        // Desktop browser: set session and redirect
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }

        if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
          return;
        }

        navigate('/', { replace: true });
      } catch (err: any) {
        setErrorMsg(err.message || 'Произошла ошибка');
        setStatus('error');
      }
    };

    handleCallback();
  }, [isNative, navigate]);

  const getDeepLink = () => {
    const hash = window.location.hash;
    return `chistovynos://auth/callback${hash}`;
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Обработка...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="ЧистоВынос" className="w-28 h-28 mb-4 drop-shadow-lg" />
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-destructive text-sm mb-4">{errorMsg}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              Перейти ко входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  // show-open-app state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="ЧистоВынос" className="w-28 h-28 mb-4 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground">ЧистоВынос</h1>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Email подтверждён!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Если у вас установлено приложение, нажмите кнопку ниже, чтобы открыть его.
          </p>
          <a
            href={getDeepLink()}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4" />
            Открыть в приложении
          </a>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full mt-3 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm transition-transform active:scale-[0.98]"
          >
            Продолжить в браузере
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
