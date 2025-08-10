import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export interface EmailDetailsProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  email: {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    date: string;
    snippet: string;
    aiSummary: string;
    suggestedReplies: string[];
    body: string;
  } | null;
}

export const EmailDetailsModal: React.FC<EmailDetailsProps> = ({ open, onOpenChange, email }) => {
  if (!email) return null;
  const providerUrl = email.id ? `https://mail.google.com/mail/u/0/#inbox/${email.id}` : undefined;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
          <DialogTitle className="text-xl">{email.subject}</DialogTitle>
          <DialogDescription className="flex items-center justify-between text-xs">
            <span>
              From {email.senderName} • {email.senderEmail}
            </span>
            <span>{new Date(email.date).toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-auto pr-1 text-sm leading-6">
          {email.aiSummary && (
            <div className="rounded-xl bg-muted p-3">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">AI Summary</span>
              <p className="mt-1 text-foreground">{email.aiSummary}</p>
            </div>
          )}
          <div className="whitespace-pre-wrap text-foreground">
            {email.body || email.snippet || "No content available."}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {providerUrl && (
              <a
                href={providerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Open in email provider"
              >
                <ExternalLink className="h-4 w-4" /> Open in provider
              </a>
            )}
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(email.aiSummary || email.body || email.snippet || "");
                  toast.success("Copied");
                } catch {
                  toast.error("Copy failed");
                }
              }}
              aria-label="Copy"
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
