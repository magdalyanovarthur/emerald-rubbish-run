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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    console.log("YooKassa webhook received:", JSON.stringify(body));

    const event = body.event;
    const paymentData = body.object;

    if (!paymentData?.metadata?.payment_id) {
      console.log("No payment_id in metadata, skipping");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = paymentData.metadata.payment_id;
    const newStatus = paymentData.status; // succeeded, canceled, waiting_for_capture

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({ status: newStatus, yookassa_payment_id: paymentData.id })
      .eq("id", paymentId);

    if (updateError) {
      console.error("Error updating payment:", updateError);
      throw new Error(`DB update error: ${updateError.message}`);
    }

    console.log(`Payment ${paymentId} updated to status: ${newStatus}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
