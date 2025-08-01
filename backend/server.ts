import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { google } from "googleapis";
import fetch from "node-fetch";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// === AI Summarization Service ===
async function summarizeWithAI(text: string): Promise<string> {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Summarize the following email snippet briefly." },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "No summary available";
  } catch (error) {
    console.error("AI Summarization error:", error);
    return "Summary unavailable";
  }
}

// === Gmail Fetch Service ===
async function fetchEmails(token: string) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 5,
  });

  const messages = response.data.messages || [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
      });

      const headers = fullMessage.data.payload?.headers || [];
      const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject";
      const from = headers.find((h) => h.name === "From")?.value || "Unknown Sender";
      const date = headers.find((h) => h.name === "Date")?.value || "Unknown Date";
      const snippet = fullMessage.data.snippet || "No snippet available";

      const aiSummary = await summarizeWithAI(snippet);

      return { subject, from, date, snippet, aiSummary };
    })
  );

  return emails;
}

// === API Endpoint ===
app.post("/api/getEmails", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Missing Google access token" });
    }

    const emails = await fetchEmails(token);
    res.json({ emails });
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("✅ Gmail AI Dashboard Backend Running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
