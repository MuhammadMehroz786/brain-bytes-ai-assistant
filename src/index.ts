// src/index.ts

import express, { Request, Response } from 'express';
import session from 'express-session';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import { OPENAI_API_KEY, IMAP_CONFIG, SMTP_CONFIG } from './config';

const app = express();
const PORT = 5000;

// ==================== Express Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key-replace-with-secure-random-string',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// ==================== OpenAI API CONFIGURATION ====================
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

async function generateAiAnalysis(body: string): Promise<{ summary: string; replies: string[] }> {
    if (!openai.apiKey) {
        return { summary: "AI Summary disabled.", replies: [] };
    }

    const prompt = `
        You are an expert email assistant.
        1. Summarize the following email into a single, concise, subject-style sentence.
        2. Suggest 3 short, practical, one-sentence replies.
        
        Return your response as a single, minified JSON object with two keys: "summary" and "replies". The "replies" key should contain an array of strings.

        Email body:
        ---
        ${body.slice(0, 2500)}
        ---
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });

        const responseText = completion.choices[0].message?.content?.trim() || '{}';
        const cleanedJsonText = responseText.replace(/```json\n|\n```/g, '');
        const data = JSON.parse(cleanedJsonText);

        return {
            summary: data.summary || "Could not generate summary.",
            replies: data.replies || ["Could not generate replies."],
        };
    } catch (e) {
        console.error("Error parsing AI JSON response:", e);
        return { summary: "AI analysis failed.", replies: [] };
    }
}

// ==================== Nodemailer (SMTP) CONFIGURATION ====================
const transporter = nodemailer.createTransport(SMTP_CONFIG);

async function sendEmail(fromEmail: string, fromPassword: string, toEmail: string, subject: string, body: string, inReplyTo?: string): Promise<boolean> {
    try {
        const mailOptions = {
            from: fromEmail,
            to: toEmail,
            subject: subject,
            text: body,
            inReplyTo: inReplyTo,
            references: inReplyTo,
        };

        // You'll need to dynamically set the auth for a real-world app or use a single user
        const dynamicTransporter = nodemailer.createTransport({
            ...SMTP_CONFIG,
            auth: {
                user: fromEmail,
                pass: fromPassword,
            }
        });

        await dynamicTransporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error("Failed to send email:", e);
        return false;
    }
}

// ==================== IMAP Client Logic (Refactored) ====================
interface EmailDetails {
    id: string;
    messageIdHeader: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    date: string;
    aiSummary: string;
    suggestedReplies: string[];
    body: string;
}

// NOTE: This logic is simplified to work in an Express route context.
async function getEmailDetails(emailId: string, user: string, pass: string): Promise<EmailDetails | null> {
    let connection: imaps.ImapSimple;
    try {
        connection = await imaps.connect({
            ...IMAP_CONFIG,
            user: user,
            password: pass
        });
        await connection.openBox('INBOX');
        const searchCriteria = [['UID', emailId]];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        if (!messages.length) return null;

        const message = messages[0];
        const parsed = await simpleParser(message.parts[0].body);
        const body = (parsed.text || parsed.html || '').toString();
        const aiAnalysis = await generateAiAnalysis(body);

        connection.end();
        
        return {
            id: message.attributes.uid.toString(),
            messageIdHeader: parsed.headers.get('message-id') as string,
            senderName: parsed.from?.text || 'Unknown Sender',
            senderEmail: parsed.from?.value[0]?.address || 'unknown@example.com',
            subject: parsed.subject || 'No Subject',
            date: parsed.date?.toISOString() || 'Unknown Date',
            aiSummary: aiAnalysis.summary,
            suggestedReplies: aiAnalysis.replies,
            body: body,
        };
    } catch (e) {
        console.error("🛑 IMAP/Email processing failed:", e);
        if (connection) connection.end();
        return null;
    }
}

async function getRecentEmails(user: string, pass: string): Promise<EmailDetails[]> {
    let connection: imaps.ImapSimple;
    try {
        connection = await imaps.connect({
            ...IMAP_CONFIG,
            user: user,
            password: pass
        });
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
                messageIdHeader: parsed.headers.get('message-id') as string,
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
        return emailDetails;
    } catch (e) {
        console.error("🛑 IMAP/Email processing failed:", e);
        if (connection) connection.end();
        return [];
    }
}


// ==================== ROUTES ========================================

app.get('/emails', async (req: Request, res: Response) => {
    if (!req.session.email || !req.session.password) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const allEmails = await getRecentEmails(req.session.email, req.session.password);

    const doneEmails = new Set(req.session.done_emails || []);
    const emailsToShow = allEmails.filter(email => !doneEmails.has(email.id));

    const page = parseInt(req.query.page as string) || 1;
    const batchSize = parseInt(req.query.batch_size as string) || 12;
    const start = (page - 1) * batchSize;
    const end = start + batchSize;

    const emailsForPage = emailsToShow.slice(start, end);
    const hasMore = emailsToShow.length > end;

    console.log(`✅ Sending page ${page} with ${emailsForPage.length} processed emails.`);
    res.json({ emails: emailsForPage, hasMore });
});

app.get('/get_email/:email_id', async (req: Request, res: Response) => {
    if (!req.session.email || !req.session.password) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const emailDetails = await getEmailDetails(req.params.email_id, req.session.email, req.session.password);

    if (emailDetails) {
        return res.json({ email: emailDetails });
    } else {
        return res.status(404).json({ error: 'Email not found.' });
    }
});

app.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Attempt to connect to IMAP to validate credentials
    let connection;
    try {
        connection = await imaps.connect({
            ...IMAP_CONFIG,
            user: email,
            password: password
        });
        await connection.end();

        // Login successful
        req.session.email = email;
        req.session.password = password;
        req.session.done_emails = [];
        return res.json({ status: 'success', message: 'Logged in successfully.' });
    } catch (e) {
        console.error("🛑 Login failed:", e);
        return res.status(401).json({ error: 'Login failed. Check credentials and ensure App Passwords are used.' });
    }
});

app.post('/send_reply', async (req: Request, res: Response) => {
    if (!req.session.email || !req.session.password) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { toEmail, originalSubject, replyText, messageIdHeader } = req.body;
    const fromEmail = req.session.email;
    const fromPassword = req.session.password;
    const replySubject = originalSubject.toLowerCase().startsWith('re:') ? originalSubject : `Re: ${originalSubject}`;

    const success = await sendEmail(fromEmail, fromPassword, toEmail, replySubject, replyText, messageIdHeader);

    if (success) {
        res.json({ status: 'success', message: 'Reply sent!' });
    } else {
        res.status(500).json({ status: 'error', message: 'Failed to send reply.' });
    }
});

app.post('/mark_as_done/:email_id', (req: Request, res: Response) => {
    if (!req.session.email) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const emailId = req.params.email_id;
    if (!req.session.done_emails) req.session.done_emails = [];
    if (!req.session.done_emails.includes(emailId)) {
        req.session.done_emails.push(emailId);
        req.session.last_done_id = emailId;
    }
    res.json({ status: 'success' });
});

app.post('/undo_mark_as_done', (req: Request, res: Response) => {
    if (!req.session.email) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const lastDoneId = req.session.last_done_id;
    if (lastDoneId && req.session.done_emails?.includes(lastDoneId)) {
        req.session.done_emails = req.session.done_emails.filter(id => id !== lastDoneId);
        delete req.session.last_done_id;
        return res.json({ status: 'success', message: 'Action undone.', undone_email_id: lastDoneId });
    }
    res.json({ status: 'error', message: 'No action to undo.' });
});

app.post('/logout', (req: Request, res: Response) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out.' });
        }
        res.json({ status: 'success', message: 'Logged out successfully.' });
    });
});

app.listen(PORT, () => {
    console.log("🚀 Gmail Summarizer starting...");
    console.log(`🟢 OpenAI API Key found: ${OPENAI_API_KEY ? 'Yes' : 'No'}.`);
    console.log(`📧 Express server is listening at http://localhost:${PORT}`);
});