import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOOKASSA_SHOP_ID = Deno.env.get("YOOKASSA_SHOP_ID");
    const YOOKASSA_SECRET_KEY = Deno.env.get("YOOKASSA_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      throw new Error("YooKassa credentials not configured");
    }

    // Verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { payment_type, amount, order_id, subscription_type, return_url } = await req.json();

    if (!payment_type || !amount || !return_url) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payment record in DB
    const { data: paymentRecord, error: dbError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        payment_type,
        amount,
        order_id: order_id || null,
        subscription_type: subscription_type || null,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`DB error: ${dbError.message}`);
    }

    // Create YooKassa payment
    const description =
      payment_type === "subscription"
        ? `Подписка "${subscription_type === "every_other_day" ? "Через день" : "Каждый день"}" — 30 дней`
        : `Оплата заказа #${order_id}`;

    const idempotenceKey = paymentRecord.id;

    const yooResponse = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`)}`,
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url,
        },
        capture: true,
        description,
        metadata: {
          payment_id: paymentRecord.id,
          payment_type,
          order_id: order_id || "",
          subscription_type: subscription_type || "",
          user_id: userId,
        },
      }),
    });

    const yooData = await yooResponse.json();

    if (!yooResponse.ok) {
      console.error("YooKassa error:", JSON.stringify(yooData));
      throw new Error(`YooKassa error [${yooResponse.status}]: ${JSON.stringify(yooData)}`);
    }

    // Update payment record with YooKassa payment ID
    await supabase
      .from("payments")
      .update({
        yookassa_payment_id: yooData.id,
        status: yooData.status,
      })
      .eq("id", paymentRecord.id);

    return new Response(
      JSON.stringify({
        confirmation_url: yooData.confirmation?.confirmation_url,
        payment_id: paymentRecord.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
