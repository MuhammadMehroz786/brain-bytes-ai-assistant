// supabase/functions/fetch-gmail-emails/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import imaps from 'npm:imap-simple';
import { simpleParser } from 'npm:mailparser';
import OpenAI from 'npm:openai';

// Define the shape of your email data
interface EmailDetails {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    date: string;
    aiSummary: string;
    suggestedReplies: string[];
    body: string;
}

// ==================== OpenAI API CONFIGURATION ====================
// Get OpenAI API key from Supabase project secrets
const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

async function generateAiAnalysis(body: string): Promise<{ summary: string; replies: string[] }> {
    if (!openai.apiKey) {
        return { summary: "AI Summary disabled.", replies: [] };
    }
    // ... (rest of the OpenAI function logic from the previous response)
    // Make sure to adapt the imports for Deno
}

// ==================== Main Supabase Function Handler ====================
serve(async (req) => {
    // This is where you would handle authentication, e.g., via JWT
    // const authHeader = req.headers.get("Authorization");
    // ...

    // Get IMAP credentials from Supabase project secrets
    const imapConfig = {
        imap: {
            user: Deno.env.get('IMAP_EMAIL_ADDRESS'),
            password: Deno.env.get('IMAP_APP_PASSWORD'),
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
        }
    };

    let connection;
    try {
        connection = await imaps.connect(imapConfig);
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const recentMessages = messages.slice(0, 200);

        const emailDetails: EmailDetails[] = [];
        for (const message of recentMessages) {
            const parsed = await simpleParser(message.parts[0].body);
            const body = (parsed.text || parsed.html || '').toString();
            const aiAnalysis = await generateAiAnalysis(body);

            emailDetails.push({
                id: message.attributes.uid.toString(),
                senderName: parsed.from?.text || 'Unknown Sender',
                senderEmail: parsed.from?.value[0]?.address || 'unknown@example.com',
                subject: parsed.subject || 'No Subject',
                date: parsed.date?.toISOString() || 'Unknown Date',
                aiSummary: aiAnalysis.summary,
                suggestedReplies: aiAnalysis.replies,
                body: body,
            });
        }
        
        connection.end();

        return new Response(JSON.stringify(emailDetails), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error("Supabase Edge Function Error:", e);
        if (connection) connection.end();
        return new Response(JSON.stringify({ error: 'Failed to fetch emails' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});