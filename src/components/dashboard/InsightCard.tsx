import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightActions } from "./InsightActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";

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

type Category = { label: string; cls: string };
const inferCategory = (subject: string): Category => {
  const s = subject.toLowerCase();
  if (/(alert|fail|error|issue|problem)/.test(s)) return { label: "Alert", cls: "bg-warning/20 text-warning-foreground border border-warning/30" };
  if (/(invoice|payment|receipt|billing|charge)/.test(s)) return { label: "Payment", cls: "bg-success/20 text-success-foreground border border-success/30" };
  if (/(metric|report|analytics|summary|stats)/.test(s)) return { label: "Metrics", cls: "bg-primary/15 text-primary border border-primary/20" };
  return { label: "General", cls: "bg-muted text-muted-foreground border" };
};

interface InsightCardProps {
  email: EmailSummaryItem;
  pinned?: boolean;
  isActive?: boolean;
  onPin: () => void;
  onCopy: () => void;
  onView: () => void;
  onMarkRead: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ email, pinned, isActive, onPin, onCopy, onView, onMarkRead }) => {
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
      className={`group break-inside-avoid rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "ring-2 ring-ring" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter") onView();
        if (e.key.toLowerCase() === "r") onMarkRead();
        if (e.key.toLowerCase() === "p") onPin();
      }}
    >
      <div className="p-4">
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm sm:text-base leading-tight truncate" title={email.subject}>
            {email.subject}
          </h3>
          <div className="opacity-0 group-hover:opacity-100 transition">
            <InsightActions pinned={!!pinned} onPin={onPin} onCopy={handleCopy} onView={onView} onMarkRead={onMarkRead} />
          </div>
        </div>

        {/* AI summary */}
        {email.aiSummary && (
          <div className="mt-2 rounded-xl bg-muted p-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">AI Summary</span>
            <p
              className="mt-1 text-sm text-muted-foreground"
              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {email.aiSummary}
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src={favicon} alt={domain ? `${domain} favicon` : "Sender favicon"} className="h-4 w-4 rounded-sm" onError={(e) => ((e.currentTarget.style.display = 'none'))} />
            <span className="text-xs text-muted-foreground truncate" title={domain}>{domain}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{time}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${category.cls}`}>{category.label}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
