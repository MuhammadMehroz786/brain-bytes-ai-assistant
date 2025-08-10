import { useMemo } from "react";

// Broad emoji matcher (approximate)
const emojiPattern = /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\u2600-\u26FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])/g;

const boilerplatePatterns = [
  /unsubscribe/i,
  /manage preferences/i,
  /view in browser/i,
  /privacy policy/i,
  /terms of service/i,
];

const amountRegex = /(\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?\s?(?:USD|EUR|GBP))/gi;
const dateRegex = /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\b(?:today|tomorrow|tonight)\b|\b\d{1,2}[:\.]\d{2}\s?(?:am|pm)?)/gi;

function stripBoilerplate(text: string) {
  return text
    .split(/\n+/)
    .filter((line) => !boilerplatePatterns.some((p) => p.test(line)))
    .join("\n");
}

function keepFirstEmoji(text: string) {
  let found = '';
  const cleaned = text.replace(emojiPattern, (m) => {
    if (!found) {
      found = m;
      return m;
    }
    return '';
  });
  return { text: cleaned, emoji: found };
}

function firstSentence(text: string) {
  const match = text.match(/[^.!?\n]+[.!?]?/);
  return match ? match[0].trim() : text.trim();
}

function extractBullets(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim());
  const bullets = lines.filter((l) => /^[-•]/.test(l)).map((l) => l.replace(/^[-•]\s?/, ''));
  if (bullets.length) return bullets.slice(0, 2);
  // fallback: split by ; and pick concise fragments
  const parts = text.split(/;|\u2022/).map((p) => p.trim()).filter(Boolean);
  return parts.slice(1, 3); // after TL;DR
}

function highlightAmounts(tldr: string) {
  const parts: Array<{ text?: string; amount?: string }> = [];
  let lastIndex = 0;
  tldr.replace(amountRegex, (m, _g1, offset) => {
    parts.push({ text: tldr.slice(lastIndex, offset) });
    parts.push({ amount: m });
    lastIndex = offset + m.length;
    return m;
  });
  parts.push({ text: tldr.slice(lastIndex) });
  return parts;
}

export interface ReadableSummary {
  cleanNodes: React.ReactNode;
  rawText: string;
  tokens: { amounts: string[]; dates: string[]; domain: string };
}

export function useReadableSummary(aiSummary: string, senderEmail: string) {
  return useMemo<ReadableSummary>(() => {
    const domain = (senderEmail.split('@')[1] || '').toLowerCase();

    const base = stripBoilerplate(aiSummary || '').trim();
    const { text: noExtraEmoji } = keepFirstEmoji(base);

    const amounts = Array.from(noExtraEmoji.matchAll(amountRegex)).map((m) => m[0]);
    const dates = Array.from(noExtraEmoji.matchAll(dateRegex)).map((m) => m[0]);

    const tldr = firstSentence(noExtraEmoji);
    const bullets = extractBullets(noExtraEmoji);

    const highlighted = highlightAmounts(tldr);

    const cleanNodes = (
      <div className="text-sm text-muted-foreground" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        <span>
          {highlighted.map((p, i) =>
            p.amount ? (
              <mark key={i} className="amount" style={{ backgroundColor: "hsl(var(--cat-current) / 0.12)", color: "hsl(var(--cat-current))" }}>
                {p.amount}
              </mark>
            ) : (
              <span key={i}>{p.text}</span>
            )
          )}
        </span>
        {bullets.length > 0 && (
          <span>{" • " + bullets.slice(0, 2).join(" • ")}</span>
        )}
      </div>
    );

    return {
      cleanNodes,
      rawText: base,
      tokens: { amounts, dates, domain },
    };
  }, [aiSummary, senderEmail]);
}
