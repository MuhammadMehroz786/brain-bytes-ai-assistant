// supabase/functions/send-email-reply/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'npm:nodemailer';

// Get SMTP credentials from Supabase project secrets
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: Deno.env.get('IMAP_EMAIL_ADDRESS'),
        pass: Deno.env.get('IMAP_APP_PASSWORD'),
    },
});

serve(async (req) => {
    try {
        const { toEmail, originalSubject, replyText, messageIdHeader } = await req.json();
        
        const fromEmail = Deno.env.get('IMAP_EMAIL_ADDRESS');
        const replySubject = originalSubject.toLowerCase().startsWith('re:') ? originalSubject : `Re: ${originalSubject}`;

        const mailOptions = {
            from: fromEmail,
            to: toEmail,
            subject: replySubject,
            html: `<p>${replyText}</p>`,
            inReplyTo: messageIdHeader,
            references: messageIdHeader,
        };

        await transporter.sendMail(mailOptions);
        
        return new Response(JSON.stringify({ status: 'success', message: 'Reply sent!' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (e) {
        console.error("Supabase Edge Function Error:", e);
        return new Response(JSON.stringify({ status: 'error', message: 'Failed to send reply.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});