import { Icons, EducationTool, StarterPath, UserPrefs } from "./types";

export const EDUCATION_DATA: {
  tools: EducationTool[];
  getStarterPath: (prefs: UserPrefs) => StarterPath;
} = {
  tools: [
    {
      id: "notion-ai",
      name: "Notion AI",
      category: "Writing",
      icon: Icons.FileText,
      gradient: ["262 83% 58%", "174 72% 56%"],
      recommended: true,
      nextLabel: "Draft a page in your voice",
      openUrl: "https://www.notion.so",
      shortcuts: ["Cmd/Ctrl+J: Ask AI", "Enter: Run", "Esc: Cancel"],
      cards: [
        {
          id: "notion-draft-voice",
          step: 1,
          title: "Draft a page in your voice (≈3 min)",
          defaults: { Topic: "", Audience: "", Tone: "Friendly", Length: "Medium", "Must-include bullets": "" },
          quickSteps: [
            "Paste your rough notes below",
            "Choose Beginner (keeps guidance visible)",
            "Open in Notion AI and refine",
          ],
          prompt: {
            beginner:
              "Write a clear page about [[Topic]] for [[Audience]] in a [[Tone]] tone. Length: [[Length]]. Use my bullet points: [[Must-include bullets]]. End with a 3-item action list.",
            advanced:
              "Write a concise page about [[Topic]] for [[Audience]] in a [[Tone]] tone (readability: Grade 7). Length: [[Length]]. Use bullets for key ideas and finish with a 3-item action list. Enforce parallel structure and avoid filler.",
          },
          pitfalls: [
            "If it’s generic → add 2 constraints (audience + outcome).",
            "If too long → set Length to Short.",
            "If voice is off → add one reference sentence in your tone.",
          ],
          mistakes: [
            "Too generic? Add audience + outcome",
            "Run-on sentences. Prefer bullets",
            "No actionables. End with 3 actions",
          ],
          whyThisWorks: "Constraint-led prompts guide tone, length, and structure",
        },
      ],
    },
    {
      id: "gpt",
      name: "ChatGPT",
      category: "Writing",
      icon: Icons.Bot,
      gradient: ["174 72% 56%", "142 76% 73%"],
      recommended: true,
      nextLabel: "Polish and fact-check",
      openUrl: "https://chat.openai.com",
      shortcuts: ["Shift+Enter: New line", "/: Commands", "Tab: Indent"] ,
      cards: [
        {
          id: "gpt-polish-check",
          step: 1,
          title: "Polish and fact-check (≈3 min)",
          defaults: { Topic: "", Audience: "", Tone: "Expert", Length: "Short", "Must-include bullets": "" },
          quickSteps: [
            "Paste your draft",
            "Pick Advanced for structure",
            "Review edits + sources",
          ],
          prompt: {
            beginner:
              "Improve this draft for [[Audience]] in a [[Tone]] tone. Keep it [[Length]]. Check facts and flag weak claims. Use my bullets: [[Must-include bullets]].",
            advanced:
              "Edit for clarity, correctness, and concision (3Cs). Add citations for claims. Deliver as: Revised + Bulleted Notes + 3-item action list.",
          },
          pitfalls: ["Too long? Set Length to Short", "Voice off? Add a sample line", "Unclear? Ask for bullets first"],
          mistakes: ["Overediting voice", "No sources", "Too dense"],
          whyThisWorks: "3Cs + structure yields quick high-quality results",
        },
      ],
    },
    {
      id: "notion-tasks",
      name: "Notion AI",
      category: "Automation",
      icon: Icons.Wand2,
      gradient: ["262 83% 58%", "142 76% 73%"],
      recommended: true,
      nextLabel: "Turn meeting notes into tasks",
      openUrl: "https://www.notion.so",
      shortcuts: ["Cmd/Ctrl+J: Ask AI", "Cmd/Ctrl+/ : Quick Find"],
      cards: [
        {
          id: "notion-notes-to-tasks",
          step: 1,
          title: "Turn meeting notes into tasks (≈3 min)",
          defaults: { Topic: "Meeting notes", Audience: "Self", Tone: "Friendly", Length: "Short", "Must-include bullets": "" },
          quickSteps: ["Paste raw notes", "Choose Beginner", "Open in Notion AI"],
          prompt: {
            beginner:
              "Turn these notes into action items with owners and due dates. Keep it [[Length]]. Add a summary at top. Notes: [[Must-include bullets]].",
            advanced:
              "Convert notes to structured action items: Owner + Due Date + Outcome. Format: Executive Summary (2 lines) + Action Table + Next Steps (3 items).",
          },
          pitfalls: ["Too long? Shorten", "Missing owners? Add names", "Vague tasks? Add outcomes"],
          mistakes: ["No owners", "No dates", "Too vague"],
          whyThisWorks: "From noise to structured actions fast",
        },
      ],
    },
  ],
  getStarterPath: (prefs: UserPrefs) => {
    const cards = [
      { toolId: "notion-ai", cardId: "notion-draft-voice", title: "Draft a page in your voice" },
      { toolId: "notion-tasks", cardId: "notion-notes-to-tasks", title: "Turn notes into tasks" },
      { toolId: "gpt", cardId: "gpt-polish-check", title: "Polish and fact-check" },
    ];
    return { id: "fast-track", title: "Fast Track (20 mins)", cards, progressPercent: 0 };
  },
};
