import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CREATE PAYMENT FUNCTION STARTED ===");
    
    // Check if Stripe key exists
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key exists:", !!stripeKey);
    console.log("Stripe key prefix:", stripeKey?.substring(0, 10));
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    
    console.log("Creating Stripe instance...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    console.log("Stripe instance created successfully");

    // Get email from request body for guest checkout
    console.log("Parsing request body...");
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const guestEmail = body.email || "guest@brainbytes.app";
    console.log("Guest email:", guestEmail);

    console.log("Creating Stripe checkout session...");
    // Create a one-time payment session for $29
    const session = await stripe.checkout.sessions.create({
      customer_email: guestEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "Brain Bytes AI Productivity Assistant",
              description: "Personalized AI-enhanced daily productivity plan"
            },
            unit_amount: 2900, // $29.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      allow_promotion_codes: true,
    });

    console.log("Payment session created successfully:", session.id);

    // Log payment session creation for analytics (optional)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    try {
      await supabaseService.from("security_audit").insert({
        user_id: null, // Guest checkout
        event_type: "payment_session_created",
        event_data: { session_id: session.id, amount: 2900, email: guestEmail },
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown"
      });
    } catch (auditError) {
      console.log("Audit log failed (non-critical):", auditError);
    }

    console.log("Returning session URL:", session.url);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("=== ERROR IN CREATE-PAYMENT FUNCTION ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("Full error object:", error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(JSON.stringify({ 
      error: "Payment processing failed",
      details: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});