import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize deep link handling for Capacitor native apps.
 * Listens for custom URL scheme (chistovynos://) and processes auth callbacks.
 */
export function initDeepLinkHandler() {
  CapacitorApp.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
    console.log('[DeepLink] Received URL:', event.url);

    try {
      const url = new URL(event.url);

      // Handle auth callback: chistovynos://auth/callback#access_token=...&refresh_token=...
      if (url.hostname === 'auth' && url.pathname === '/callback') {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[DeepLink] Failed to set session:', error.message);
          } else {
            console.log('[DeepLink] Session set successfully');
          }
        }

        // Handle password recovery deep link
        const type = hashParams.get('type');
        if (type === 'recovery') {
          window.location.hash = '#type=recovery';
          window.location.pathname = '/reset-password';
        }
      }
    } catch (err) {
      console.error('[DeepLink] Error processing URL:', err);
    }
  });
}
