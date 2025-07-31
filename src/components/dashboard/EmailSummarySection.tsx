import imaps from 'imap-simple';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import OpenAI from 'openai';

// --- INTERFACES ---
interface EmailCredentials {
  email: string;
  password: string; // App-specific password
}

interface EmailSummary {
  id: string; // This is the IMAP UID
  message_id_header: string | undefined;
  sender_name: string | undefined;
  sender_email: string | undefined;
  subject: string | undefined;
  date: string | undefined;
  ai_summary: string;
  suggested_replies: string[];
  body: string | undefined;
}

interface SendReplyOptions {
  to_email: string;
  subject: string;
  reply_text: string;
  message_id_header?: string; // Original email's Message-ID for threading
}

interface AiAnalysis {
  summary: string;
  replies: string[];
}

// --- MAIN SERVICE CLASS ---
export class EmailService {
  private credentials: EmailCredentials;
  private openai: OpenAI;

  constructor(credentials: EmailCredentials) {
    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password are required.");
    }
    this.credentials = credentials;

    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates an AI summary and suggested replies for an email body.
   */
  private async generateAiAnalysis(body: string): Promise<AiAnalysis> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set. Skipping AI analysis.");
      return { summary: "AI analysis is disabled.", replies: [] };
    }

    const prompt = `
    You are an expert email assistant.
    1. Summarize the following email into a single, concise, subject-style sentence.
    2. Suggest 3 short, practical, one-sentence replies.

    Return your response as a single, minified JSON object with two keys: "summary" and "replies". The "replies" key should contain an array of strings.

    Email body:
    ---
    ${body.substring(0, 2500)}
    ---
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error("Empty response from OpenAI");
      }
      
      const data = JSON.parse(responseContent);

      return {
        summary: data.summary || "Could not generate summary.",
        replies: data.replies || [],
      };
    } catch (error) {
      console.error("Error during AI analysis:", error);
      return { summary: "AI analysis failed.", replies: [] };
    }
  }

  /**
   * Connects to the Gmail IMAP server and fetches recent emails.
   */
  public async fetchEmails(limit: number = 20): Promise<EmailSummary[]> {
    const config: imaps.ImapSimpleOptions = {
      imap: {
        user: this.credentials.email,
        password: this.credentials.password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 5000,
        tlsOptions: { rejectUnauthorized: false },
      },
    };

    let connection: imaps.ImapSimple | null = null;
    try {
      connection = await imaps.connect(config);
      await connection.openBox('INBOX');

      const searchCriteria = ['ALL'];
      const fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM SUBJECT DATE MESSAGE-ID)', 'TEXT'],
        struct: true,
      };

      // Fetch all messages that match the search criteria
      const messages = await connection.search(searchCriteria, fetchOptions);
      
      // Sort all messages by date descending (newest first) in memory
      const sortedMessages = messages.sort((a, b) => {
        const dateA = a.attributes.date?.getTime() || 0;
        const dateB = b.attributes.date?.getTime() || 0;
        return dateB - dateA;
      }).slice(0, limit); // Then take the top 'limit'

      const emailSummaries: EmailSummary[] = [];

      for (const item of sortedMessages) {
        const header = item.parts.find(part => part.which === 'HEADER.FIELDS (FROM SUBJECT DATE MESSAGE-ID)')?.body;
        const body = item.parts.find(part => part.which === 'TEXT')?.body;
        
        if (!header || !body) continue;

        // Use mailparser to reliably parse sender name/email
        const parsedFrom = await simpleParser(`From: ${header.from[0]}`);

        // Generate AI Analysis
        const aiAnalysis = await this.generateAiAnalysis(body);

        emailSummaries.push({
          id: item.attributes.uid.toString(),
          message_id_header: header['message-id']?.[0],
          sender_name: parsedFrom.from?.value[0]?.name,
          sender_email: parsedFrom.from?.value[0]?.address,
          subject: header.subject?.[0],
          date: header.date?.[0],
          ai_summary: aiAnalysis.summary,
          suggested_replies: aiAnalysis.replies,
          body: body,
        });
      }

      return emailSummaries;

    } catch (error) {
      console.error('Failed to fetch emails:', error);
      throw new Error('Could not connect to IMAP server or fetch emails. Check credentials.');
    } finally {
      if (connection?.state !== 'disconnected') {
        connection?.end();
      }
    }
  }

  /**
   * Sends a reply email via Gmail's SMTP server.
   */
  public async sendReply(options: SendReplyOptions): Promise<{ success: boolean; message: string }> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: this.credentials.email,
        pass: this.credentials.password,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${this.credentials.email}" <${this.credentials.email}>`, // It's good practice to set a name
      to: options.to_email,
      subject: options.subject.toLowerCase().startsWith('re:') ? options.subject : `Re: ${options.subject}`,
      text: options.reply_text,
    };
    
    // For proper email threading in clients like Gmail
    if (options.message_id_header) {
        mailOptions.inReplyTo = options.message_id_header;
        mailOptions.references = options.message_id_header;
    }

    try {
      await transporter.verify(); // Verify connection configuration
      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return { success: true, message: 'Reply sent successfully!' };
    } catch (error) {
      console.error('Failed to send reply:', error);
      throw new Error('Failed to send reply email.');
    }
  }
}
