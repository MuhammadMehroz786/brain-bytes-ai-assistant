import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Label } from "@/components/ui/label";

import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, BookOpen, ListChecks, Zap } from "lucide-react";

interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}

interface QuizAnswers {
  helpWith: string;
  experience: string;
  frustration: string;
}

export const IntroScreen = ({ onStart, onAuth }: IntroScreenProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    helpWith: "",
    experience: "",
    frustration: ""
  });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    document.title = "Brain Bytes – AI Education Hub";
    const desc =
      "Get matched with 5–7 AI tools and plain‑English how‑to guides. Quick wins in minutes.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    (meta as HTMLMetaElement).setAttribute("content", desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.origin + "/";
  }, []);

  const hasAnyAnswer = Object.values(answers).some((v) => v);
  const canSubmit = email.trim() !== "" && hasAnyAnswer;

  const handleJoinWaitlist = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("prelaunch_roi_waitlist")
        .insert([{ email }]);
      if (error) {
        // 23505 = unique_violation
        if ((error as any).code === "23505") {
          // no-op: already on waitlist, still show success
          setShowSuccess(true);
        } else {
          alert("Something went wrong. Please try again.");
        }
      } else {
        setShowSuccess(true);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToEmail = () => {
    emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    emailInputRef.current?.focus();
  };


  const renderQuizStep = () => {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold text-foreground">Help us match your tools</h3>
          <p className="text-sm text-muted-foreground">Answer a few quick questions to get matched.</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">What do you want AI to help you with?</h4>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            {["Create content","Summarize & organize","Automate tasks","Research faster"].map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, helpWith: answers.helpWith === opt ? "" : opt })}
                className={`px-3 py-2 rounded-full text-sm border transition ${
                  answers.helpWith === opt
                    ? "bg-gradient-to-r from-[hsl(var(--brand-blue))] to-[hsl(var(--brand-teal))] text-white border-transparent"
                    : "bg-white text-foreground border-border hover:bg-secondary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Your current experience?</h4>
          <div className="grid grid-cols-3 gap-2">
            {["Beginner","Tried a few tools","Use it regularly"].map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, experience: answers.experience === opt ? "" : opt })}
                className={`px-3 py-2 rounded-full text-sm border transition ${
                  answers.experience === opt
                    ? "bg-gradient-to-r from-[hsl(var(--brand-blue))] to-[hsl(var(--brand-teal))] text-white border-transparent"
                    : "bg-white text-foreground border-border hover:bg-secondary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Your biggest frustration?</h4>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            {["Too many options","Confusing tools","No time","Don’t know what to ask"].map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, frustration: answers.frustration === opt ? "" : opt })}
                className={`px-3 py-2 rounded-full text-sm border transition ${
                  answers.frustration === opt
                    ? "bg-gradient-to-r from-[hsl(var(--brand-blue))] to-[hsl(var(--brand-teal))] text-white border-transparent"
                    : "bg-white text-foreground border-border hover:bg-secondary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input
            id="email"
            ref={emailInputRef}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[22px]"
          />
        </div>

        <Button
          onClick={handleJoinWaitlist}
          disabled={!canSubmit || isSubmitting}
          variant="gradient"
          className="w-full rounded-[22px] py-6 text-base disabled:opacity-60"
        >
          Join the Waitlist
        </Button>
        <p className="text-xs text-muted-foreground text-center">We’ll send 5–7 matched tools + simple how‑to guides.</p>
      </div>
    );
  };
  return (
    <div className="min-h-[100dvh] overflow-hidden lg:overflow-visible bg-primary-light/60">
      {/* Desktop Header - Logo centered, no nav */}
      <div className="hidden lg:flex items-center justify-center py-4">
        <div className="inline-flex items-center gap-2">
          <img alt="Brain Bytes logo" className="w-8 h-8 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          <span className="text-2xl font-bold text-foreground">Brain Bytes</span>
        </div>
      </div>

      {/* Mobile Header - Logo centered */}
      <header className="lg:hidden h-14 px-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-2">
          <img alt="Brain Bytes logo" className="w-6 h-6 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          <span className="text-base font-semibold text-foreground">Brain Bytes</span>
        </div>
      </header>

      <main className="lg:hidden h-[calc(100dvh-56px)] overflow-hidden px-4">
        {/* Hero Section */}
        <section className="pt-2 pb-3 text-center">
          <h1 className="text-2xl font-bold text-foreground">Overwhelmed by AI tools?</h1>
          <p className="mt-2 text-sm text-muted-foreground">We pick the right ones for you—and teach you exactly how to use them in minutes.</p>
        </section>

        {/* Feature tiles */}
        <section className="pb-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-border rounded-[16px] p-2 shadow-sm flex flex-col items-center">
              <ListChecks className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-center mt-1">Curated Tool Picks</span>
            </div>
            <div className="bg-white border border-border rounded-[16px] p-2 shadow-sm flex flex-col items-center">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-center mt-1">Plain‑English Guides</span>
            </div>
            <div className="bg-white border border-border rounded-[16px] p-2 shadow-sm flex flex-col items-center">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-center mt-1">Quick Wins</span>
            </div>
          </div>
        </section>

        {/* Before → After visual */}
        <section className="pb-2">
          <Card className="rounded-[22px] border border-border shadow-sm">
            <AspectRatio ratio={16/9}>
              <div className="relative h-full w-full rounded-[22px] overflow-hidden">
                <div className="absolute inset-0 rounded-[22px] p-[1px] bg-gradient-to-r from-[hsl(var(--brand-blue))] to-[hsl(var(--brand-teal))]">
                  <div className="h-full w-full rounded-[22px] bg-white p-3">
                    <div className="grid grid-cols-2 gap-2 h-full">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-xs text-muted-foreground">Before: Too many tools</span>
                        <div className="grid grid-cols-3 gap-1 opacity-60">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-6 rounded-md bg-muted" />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-xs text-foreground">After: Your matched tools + guides</span>
                        <div className="grid grid-cols-3 gap-1">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-6 rounded-md border border-border bg-secondary relative">
                              <CheckCircle2 className="absolute -top-2 -right-2 h-3 w-3 text-[hsl(var(--brand-teal))]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AspectRatio>
          </Card>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">You’ll get 5–7 matches like these—plus simple guides.</p>
        </section>

        {/* Mobile Quiz */}
        <section className="pt-2">
          <Card className="rounded-[22px] border border-border shadow-sm max-h-[48vh] overflow-y-auto">
            <div className="p-4">{renderQuizStep()}</div>
          </Card>
        </section>
      </main>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-10 items-center" style={{ minHeight: "calc(100vh - 96px)" }}>
            {/* Left: Hero */}
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-foreground">Overwhelmed by AI tools?</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                We pick the right ones for you—and teach you exactly how to use them in minutes.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-border rounded-[22px] p-4 shadow-sm text-center">
                  <ListChecks className="h-5 w-5 mx-auto text-primary" />
                  <div className="mt-2 text-sm font-medium">Curated Tool Picks</div>
                </div>
                <div className="bg-white border border-border rounded-[22px] p-4 shadow-sm text-center">
                  <BookOpen className="h-5 w-5 mx-auto text-primary" />
                  <div className="mt-2 text-sm font-medium">Plain‑English How‑To Guides</div>
                </div>
                <div className="bg-white border border-border rounded-[22px] p-4 shadow-sm text-center">
                  <Zap className="h-5 w-5 mx-auto text-primary" />
                  <div className="mt-2 text-sm font-medium">Quick Wins in Minutes</div>
                </div>
              </div>
            </div>

            {/* Right: Quiz Card */}
            <div>
              <Card className="rounded-[22px] border border-border shadow-sm">
                <div className="p-6">{renderQuizStep()}</div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-3 left-0 right-0 px-4 z-50">
        <Button variant="gradient" className="w-full rounded-full py-4 shadow-md" onClick={scrollToEmail}>
          Join the Waitlist
        </Button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[22px] shadow-lg max-w-md w-[90%] p-6">
            <h3 className="text-2xl font-bold text-center mb-1">You’re in!</h3>
            <p className="text-center text-muted-foreground mb-5">We’ll send your first matches soon.</p>
            <div className="space-y-3">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Claude</div>
                  <span className="text-xs text-muted-foreground">Best for long docs</span>
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Perplexity</div>
                  <span className="text-xs text-muted-foreground">Best for research with sources</span>
                </div>
              </div>
            </div>
            <Button className="mt-6 w-full" onClick={() => setShowSuccess(false)}>Close</Button>
          </div>
        </div>
      )}

    </div>
  );
};