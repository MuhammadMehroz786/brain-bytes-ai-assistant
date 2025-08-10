import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightActions } from "./InsightActions";
import { toast } from "sonner";
import { format } from "date-fns";
import { LeftStripe } from "./LeftStripe";
import { TokenChip } from "./TokenChip";
import { useReadableSummary } from "@/hooks/useReadableSummary";
export interface EmailSummaryItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  aiSummary: string;
  suggestedReplies: string[];
  body: string;
}

const getDomainFromEmail = (email: string) => email.split("@")[1] || "";
const getFaviconUrl = (email: string) => {
  const domain = getDomainFromEmail(email);
  return domain ? `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domain)}` : "";
};

type Category = { label: string; name: 'alert'|'finance'|'calendar'|'security'|'shopping'|'social'|'general' };
const inferCategory = (subject: string): Category => {
  const s = subject.toLowerCase();
  if (/(alert|fail|error|issue|problem|incident|downtime|breach|security)/.test(s)) return { label: "Alert", name: 'alert' };
  if (/(invoice|payment|receipt|billing|charge|finance|payout|refund)/.test(s)) return { label: "Finance", name: 'finance' };
  if (/(calendar|meeting|invite|event|schedule|reminder)/.test(s)) return { label: "Calendar", name: 'calendar' };
  if (/(password|verify|2fa|suspicious|login)/.test(s)) return { label: "Security", name: 'security' };
  if (/(order|shipped|delivery|tracking|cart|purchase)/.test(s)) return { label: "Shopping", name: 'shopping' };
  if (/(follow|like|comment|social|post|mention)/.test(s)) return { label: "Social", name: 'social' };
  return { label: "General", name: 'general' };
};

interface InsightCardProps {
  email: EmailSummaryItem;
  pinned?: boolean;
  isActive?: boolean;
  onPin: () => void;
  onCopy: () => void;
  onView: () => void;
  onMarkRead: () => void;
  defaultCleanMode?: 'clean'|'raw';
}

export const InsightCard: React.FC<InsightCardProps> = ({ email, pinned, isActive, onPin, onCopy, onView, onMarkRead, defaultCleanMode = (localStorage.getItem('bb_summary_mode') as 'clean'|'raw') || 'clean' }) => {
  const favicon = useMemo(() => getFaviconUrl(email.senderEmail), [email.senderEmail]);
  const domain = useMemo(() => getDomainFromEmail(email.senderEmail), [email.senderEmail]);
  const category = useMemo(() => inferCategory(email.subject), [email.subject]);
  const time = useMemo(() => {
    try {
      return format(new Date(email.date), "HH:mm");
    } catch {
      return "";
    }
  }, [email.date]);
  const [mode, setMode] = useState<'clean'|'raw'>(defaultCleanMode);
  const summary = useReadableSummary(email.aiSummary, email.senderEmail);
  const catVar = useMemo(() => {
    switch (category.name) {
      case 'alert': return 'var(--cat-alert)';
      case 'finance': return 'var(--cat-finance)';
      case 'calendar': return 'var(--cat-calendar)';
      case 'security': return 'var(--cat-security)';
      case 'shopping': return 'var(--cat-shopping)';
      case 'social': return 'var(--cat-social)';
      default: return 'var(--cat-general)';
    }
  }, [category.name]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email.aiSummary || "");
      toast.success("Summary copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Card
      role="article"
      tabIndex={0}
      className={`relative group break-inside-avoid rounded-2xl border bg-card text-card-foreground shadow-sm transition will-change-transform focus-visible:outline-none focus-visible:ring-2 ${isActive ? "ring-2" : ""}`}
      style={{ ['--tw-ring-color' as any]: `hsl(var(--cat-current))`, ['--cat-current' as any]: catVar }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onView();
        if (e.key.toLowerCase() === "r") onMarkRead();
        if (e.key.toLowerCase() === "p") onPin();
      }}
    >
      <LeftStripe />
      <div className="p-4">
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm sm:text-base leading-tight truncate" title={email.subject}>
            {email.subject}
          </h3>
          <div className="opacity-0 group-hover:opacity-100 transition">
            <InsightActions pinned={!!pinned} onPin={onPin} onCopy={handleCopy} onView={onView} onMarkRead={onMarkRead} isClean={mode==='clean'} onToggleClean={() => setMode((m)=> m==='clean'?'raw':'clean')} />
          </div>
        </div>

        {/* AI summary */}
        {email.aiSummary && (
          <div className="mt-2 rounded-xl bg-muted p-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text text-transparent">AI Summary</span>
            {mode === 'clean' ? (
              <div className="mt-1">{summary.cleanNodes}
                {summary.tokens.domain && (
                  <span className="ml-2 align-middle"><TokenChip label={summary.tokens.domain} /></span>
                )}
              </div>
            ) : (
              <p
                className="mt-1 text-sm text-muted-foreground"
                style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
              >
                {email.aiSummary}
              </p>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src={favicon} alt={domain ? `${domain} favicon` : "Sender favicon"} className="h-4 w-4 rounded-sm" onError={(e) => ((e.currentTarget.style.display = 'none'))} />
            <TokenChip label={domain} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{time}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px]`} style={{ backgroundColor: 'hsl(var(--cat-current) / 0.10)', color: 'hsl(var(--cat-current))' }}>{category.label}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
