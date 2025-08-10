import React, { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { ExternalLink, Copy, Star, StarOff } from "lucide-react"
import { toast } from "sonner"

// Local email type matching existing shape (do not change backend types)
interface Email {
  id: string
  senderName: string
  senderEmail: string
  subject: string
  date: string
  snippet: string
  aiSummary: string
  suggestedReplies: string[]
  body: string
}

interface EmailCardProps {
  email: Email
  pinned?: boolean
  onTogglePin?: (id: string) => void
}

const getDomainFromEmail = (email: string) => {
  const match = email.split("@")[1]
  return match || ""
}

const getFaviconUrl = (email: string) => {
  const domain = getDomainFromEmail(email)
  return domain ? `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domain)}` : ""
}

const inferCategory = (subject: string): { label: string; cls: string } => {
  const s = subject.toLowerCase()
  if (/(invoice|payment|receipt|billing|charge)/.test(s)) return { label: "Payment", cls: "bg-emerald-50 text-emerald-700" }
  if (/(metric|report|analytics|summary|stats)/.test(s)) return { label: "Metrics", cls: "bg-indigo-50 text-indigo-700" }
  if (/(booking|reservation|schedule|appointment)/.test(s)) return { label: "Booking", cls: "bg-amber-50 text-amber-700" }
  return { label: "General", cls: "bg-slate-50 text-slate-700" }
}

export function EmailCard({ email, pinned = false, onTogglePin }: EmailCardProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const favicon = useMemo(() => getFaviconUrl(email.senderEmail), [email.senderEmail])
  const initials = useMemo(() => {
    const parts = email.senderName.trim().split(" ")
    return (parts[0]?.[0] || "?") + (parts[1]?.[0] || "")
  }, [email.senderName])

  const category = useMemo(() => inferCategory(email.subject), [email.subject])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email.aiSummary || email.snippet || "")
      toast.success("Summary copied to clipboard")
    } catch {
      toast.error("Failed to copy summary")
    }
  }

  const providerUrl = useMemo(() => {
    // Open in Gmail by message id (client-only convenience link)
    return email.id ? `https://mail.google.com/mail/u/0/#inbox/${email.id}` : undefined
  }, [email.id])

  return (
    <Card className="break-inside-avoid w-full mb-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9">
              {favicon && <AvatarImage src={favicon} alt={`${email.senderName} favicon`} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-foreground truncate">{email.senderName}</div>
              <div className="text-xs text-muted-foreground truncate">{email.senderEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{new Date(email.date).toLocaleDateString()}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={pinned ? "Unpin email" : "Pin email"}
              onClick={() => onTogglePin?.(email.id)}
              className="h-8 w-8"
              title={pinned ? "Unpin" : "Pin"}
            >
              {pinned ? <Star className="text-yellow-500" /> : <StarOff className="text-slate-500" />}
            </Button>
          </div>
        </div>

        {/* Subject */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="mt-3 text-left text-lg font-semibold text-slate-900 hover:text-slate-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label="Read full email"
            >
              {email.subject}
            </button>
          </DialogTrigger>
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
            <div className="max-h-[60vh] overflow-auto pr-1 text-sm leading-6 text-foreground">
              {email.body || email.snippet || "No content available."}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {providerUrl && (
                  <a
                    href={providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-gradient-to-r from-primary via-secondary to-accent text-white hover:opacity-95"
                    aria-label="Open in email provider"
                  >
                    <ExternalLink className="h-4 w-4" /> Open in provider
                  </a>
                )}
                <Button variant="ghost" onClick={handleCopy} aria-label="Copy summary">
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category */}
        <div className="mt-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${category.cls}`}>{category.label}</span>
        </div>

        {/* Snippet */}
        {email.snippet && (
          <p className="mt-3 text-sm text-muted-foreground">{email.snippet}</p>
        )}

        {/* AI Summary */}
        {email.aiSummary && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-slate-700">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-600">AI Summary</span>
            <p
              className="mt-1 text-sm"
              style={expanded ? undefined : { display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {email.aiSummary}
            </p>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs text-primary hover:underline"
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Button className="bg-gradient-to-r from-primary via-secondary to-accent text-white" onClick={() => setOpen(true)}>
            Read full email
          </Button>
          <Button variant="ghost" onClick={handleCopy} aria-label="Copy summary">
            <Copy className="h-4 w-4 mr-2" /> Copy summary
          </Button>
          <Button
            variant="ghost"
            onClick={() => onTogglePin?.(email.id)}
            aria-label={pinned ? "Unpin email" : "Pin email"}
          >
            {pinned ? <Star className="h-4 w-4 mr-2 text-yellow-500" /> : <StarOff className="h-4 w-4 mr-2 text-slate-500" />}
            {pinned ? "Pinned" : "Pin"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
