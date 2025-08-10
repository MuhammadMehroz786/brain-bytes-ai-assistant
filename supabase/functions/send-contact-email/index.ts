import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // Security headers
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "X-XSS-Protection": "1; mode=block",
};

interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getClientIP = (req: Request): string | null => {
  const xff = req.headers.get("x-forwarded-for") || req.headers.get("X-Forwarded-For");
  if (!xff) return null;
  return xff.split(",")[0].trim();
};

const isValidEmail = (email: string) => {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 320) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, subject, message }: ContactFormData = await req.json();

    // Basic sanitization and normalization
    const name = (fullName || "").trim();
    const mail = (email || "").trim().toLowerCase();
    const sub = (subject || "").trim();
    const msg = (message || "").trim();

    // Validate required fields and limits
    if (!name || !mail || !sub || !msg) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isValidEmail(mail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (name.length > 120 || sub.length > 150 || msg.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Input too long. Please shorten your message." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limiting via RPC (5 attempts / 15 minutes per IP)
    const ip = getClientIP(req);
    const { data: rl, error: rlError } = await supabase.rpc("enhanced_security_check", {
      event_type_param: "contact_submit",
      user_id_param: null,
      ip_param: ip,
      max_attempts: 5,
      window_minutes: 15,
    });

    if (rlError) {
      console.error("Rate limit check error", { code: rlError.code });
    } else if (rl && rl.allowed === false) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "900", ...corsHeaders },
        }
      );
    }

    // Compose safe HTML/text
    const safeName = escapeHtml(name);
    const safeMail = escapeHtml(mail);
    const safeSub = escapeHtml(sub);
    const safeMsg = escapeHtml(msg).replace(/\n/g, "<br>");

    const emailResponse = await resend.emails.send({
      from: "Brain Bytes Contact <onboarding@resend.dev>",
      to: ["bybrainbytes@gmail.com"],
      replyTo: mail,
      subject: `New Contact Form Submission – ${safeSub}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeMail}</p>
        <p><strong>Subject:</strong> ${safeSub}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${safeMsg}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from the Brain Bytes contact form.
          You can reply directly to this email to respond to ${safeName}.
        </p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${mail}
Subject: ${sub}

Message:
${msg}

---
This email was sent from the Brain Bytes contact form.
You can reply directly to this email to respond to ${name}.
      `,
    });

    // Minimal logging without sensitive data
    const emailDomain = mail.includes("@") ? mail.split("@")[1] : null;
    await supabase.from("enhanced_security_audit").insert({
      event_type: "contact_submit",
      user_id: null,
      ip_address: ip,
      user_agent: req.headers.get("user-agent"),
      risk_score: rl?.risk_score ?? 25,
      event_details: {
        email_domain: emailDomain,
        subject_length: sub.length,
        message_length: msg.length,
        rate_limited: rl?.allowed === false ? true : false,
      },
    });

    return new Response(JSON.stringify({ success: true, data: { id: emailResponse?.id ?? null } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function", { name: error?.name, code: error?.code });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
