// src/config.ts

import dotenv from 'dotenv';
dotenv.config();

export const IMAP_CONFIG = {
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 30000,
    connTimeout: 30000,
};

export const SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
};

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

if (!OPENAI_API_KEY) {
    console.warn("🔴 WARNING: OPENAI_API_KEY is not set. AI features will be disabled.");
}