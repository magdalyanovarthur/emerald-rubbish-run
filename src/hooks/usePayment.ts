import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreatePaymentParams {
  payment_type: 'order' | 'subscription';
  amount: number;
  order_id?: string;
  subscription_type?: string;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPayment = async (params: CreatePaymentParams) => {
    setIsProcessing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast({ title: 'Ошибка', description: 'Необходимо авторизоваться', variant: 'destructive' });
        return null;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...params,
            return_url: window.location.origin + '/?payment=success',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      }

      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка оплаты';
      toast({ title: 'Ошибка оплаты', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    const { data } = await supabase
      .from('payments')
      .select('status')
      .eq('id', paymentId)
      .single();
    return data?.status;
  };

  return { createPayment, checkPaymentStatus, isProcessing };
}
