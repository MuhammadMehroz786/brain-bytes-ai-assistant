import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { WaitlistSignup } from "./WaitlistSignup";
import { ArrowDown, CheckCircle2, BookOpen, Bot, LayoutDashboard, ListChecks, Zap, GraduationCap, Filter, Lightbulb } from "lucide-react";

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
  const [showResult, setShowResult] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    helpWith: "",
    experience: "",
    frustration: ""
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Basic SEO for the landing page
  useEffect(() => {
    document.title = "Brain Bytes — Overwhelmed by AI?";
    const desc = "Curated picks, how‑to guides, and a personal AI assistant. Start in minutes.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const getPersonalizedMessage = () => {
    const helpWithText = answers.helpWith || "optimize your workflow";
    return `Based on your goals, we'll build your AI Assistant to help you ${helpWithText.toLowerCase()}. You don't have to figure it all out — we'll guide you.`;
  };

  const isQuizComplete = () => {
    return answers.helpWith !== "" && answers.experience !== "" && answers.frustration !== "";
  };

  const handleSubmit = () => {
    if (isQuizComplete()) {
      setShowResult(true);
    }
  };

  const questions = [
    {
      title: "What do you want AI to help you with?",
      options: [
        "Create content faster",
        "Stay organized", 
        "Automate tasks"
      ],
      key: "helpWith" as keyof QuizAnswers
    },
    {
      title: "What's your current experience with AI?",
      options: [
        "Beginner",
        "I've tried a few tools",
        "I use it regularly"
      ],
      key: "experience" as keyof QuizAnswers
    },
    {
      title: "What's your biggest frustration so far?",
      options: [
        "Too many options",
        "Confusing tools",
        "No time to learn"
      ],
      key: "frustration" as keyof QuizAnswers
    }
  ];

  const renderQuizStep = () => {
    if (showResult) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-slate-700 text-base leading-relaxed font-medium">
              {getPersonalizedMessage()}
            </p>
          </div>
          
          {/* Plan Preview */}
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-lg p-4 mb-4">
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Your Plan Includes</p>
              <div className="flex justify-center items-center space-x-4 text-sm text-slate-600">
                <span>🎯 Tool Picks</span>
                <span className="text-slate-300">·</span>
                <span>📘 How-To Guides</span>
                <span className="text-slate-300">·</span>
                <span>🧠 Daily Workflow</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsWaitlistOpen(true)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-base px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Join the Waitlist – Get Early Access
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.key} className="space-y-3">
            {index > 0 && <div className="w-full h-px bg-slate-200/60 my-4"></div>}
            <h3 className="text-base font-semibold text-slate-800">{question.title}</h3>
            <div className="grid grid-cols-3 gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setAnswers({ ...answers, [question.key]: option })}
                  className={`px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
                    answers[question.key] === option
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-primary/30 hover:bg-slate-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Live Preview Placeholder */}
        {Object.values(answers).some(answer => answer !== "") && (
          <div className="bg-slate-50/60 border border-slate-200/50 rounded-lg p-3 mt-4">
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-slate-600">Plan Preview</p>
              <div className="flex justify-center items-center space-x-3 text-xs text-slate-500">
                <span>🎯 Tool Picks</span>
                <span className="text-slate-300">·</span>
                <span>📘 How-To Guides</span>
                <span className="text-slate-300">·</span>
                <span>🧠 Daily Workflow</span>
              </div>
              <p className="text-xs text-slate-400">(Preview updates as you answer)</p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={!isQuizComplete()}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold text-base px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Show My Plan
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-primary-light">
      {/* Header (Desktop) */}
      <div className="hidden lg:flex sticky top-0 z-40 h-12 px-6 items-center justify-between bg-white/60 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text text-transparent tracking-tight">Brain Bytes</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsWaitlistOpen(true)} className="h-8 px-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-sm">
            Join the Waitlist
          </Button>
        </div>
      </div>

      {/* Header (Mobile & Tablet) */}
      <header className="lg:hidden h-12 bg-white/60 backdrop-blur-sm border-b border-border shadow-sm px-4">
        <div className="flex items-center justify-between h-full">
          <span className="text-base font-bold bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text text-transparent tracking-tight">Brain Bytes</span>
          <Button onClick={() => setIsWaitlistOpen(true)} className="h-8 px-3 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 rounded-lg">
            Join the Waitlist
          </Button>
        </div>
      </header>

      <main className="lg:hidden h-[calc(100dvh-48px)] overflow-hidden">
        <div className="grid h-full grid-rows-[1fr_.9fr_.8fr_.8fr_.8fr_.6fr] gap-2 px-5">
          {/* 1. Hero block */}
          <section className="relative flex items-center justify-center text-center">
            <div>
              <h1 className="text-[clamp(22px,6vw,28px)] font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Overwhelmed by AI?
                </span>
              </h1>
              <p className="mt-1.5 text-[12px] text-muted-foreground">We solve it for the price of lunch</p>
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground/80 animate-float absolute -bottom-0.5 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 2. Demo block */}
          <section className="relative">
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-card">
              <iframe
                src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ"
                width="100%"
                height="180"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video"
                title="Brain Bytes Demo"
              />
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 3. 3-Step Process */}
          <section className="relative">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1.5 bg-card/90 border border-border rounded-2xl p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <ListChecks className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-medium text-foreground text-center">Answer 5 Questions</span>
                <span className="text-[10px] text-muted-foreground text-center -mt-0.5">Tell us your goals.</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 bg-card/90 border border-border rounded-2xl p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-medium text-foreground text-center">Get Your Dashboard</span>
                <span className="text-[10px] text-muted-foreground text-center -mt-0.5">Your tools & guides, ready.</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 bg-card/90 border border-border rounded-2xl p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <Zap className="w-4 h-4 text-success" />
                <span className="text-[11px] font-medium text-foreground text-center">Start in Minutes</span>
                <span className="text-[10px] text-muted-foreground text-center -mt-0.5">Skip the overwhelm.</span>
              </div>
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 4. Features */}
          <section className="relative">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-semibold text-foreground text-center">Curated Picks</span>
                <span className="text-[10px] text-muted-foreground text-center">Only what matters.</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                <BookOpen className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-semibold text-foreground text-center">How‑To Guides</span>
                <span className="text-[10px] text-muted-foreground text-center">Bite-size steps.</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                <Bot className="w-4 h-4 text-success" />
                <span className="text-[11px] font-semibold text-foreground text-center">Assistant</span>
                <span className="text-[10px] text-muted-foreground text-center">Personal to you.</span>
              </div>
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 5. Why This Works */}
          <section className="relative">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-semibold text-foreground text-center">No AI Experience Required</span>
                <span className="text-[10px] text-muted-foreground text-center">Start from zero, get results fast.</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                <Filter className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-semibold text-foreground text-center">Skip the Noise</span>
                <span className="text-[10px] text-muted-foreground text-center">Only see tools relevant to you.</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
                <Lightbulb className="w-4 h-4 text-success" />
                <span className="text-[11px] font-semibold text-foreground text-center">Learn While You Work</span>
                <span className="text-[10px] text-muted-foreground text-center">Grow skills as you use AI daily.</span>
              </div>
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 6. CTA block */}
          <section className="flex flex-col justify-center">
            <Button onClick={() => setIsWaitlistOpen(true)} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-base px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all">
              Join the Waitlist
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">Launching soon. Early members get perks.</p>
          </section>
        </div>
      </main>

      {/* Desktop One-Screen Layout */}
      <div className="hidden lg:grid h-[calc(100vh-48px)] overflow-hidden">
        <div className="grid h-full grid-rows-[1.1fr_1fr_.9fr_.9fr_.9fr_.7fr] gap-4 px-8 max-w-6xl mx-auto">
          {/* 1. Hero Block */}
          <section className="relative flex items-center justify-center text-center">
            <div>
              <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Overwhelmed by AI?
                </span>
              </h1>
              <p className="mt-2 text-[clamp(12px,1.5vw,16px)] text-muted-foreground">We solve it for the price of lunch</p>
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground/80 animate-float absolute bottom-0.5 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 2. Demo Block */}
          <section className="relative">
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-card h-full">
              <iframe
                src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                title="Brain Bytes Demo"
              />
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 3. 3-Step Process */}
          <section className="relative">
            <div className="grid grid-cols-3 gap-3 h-full">
              <div className="flex flex-col items-center justify-center gap-2 bg-card/90 border border-border rounded-2xl p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <ListChecks className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground text-center">Answer 5 Questions</span>
                <span className="text-xs text-muted-foreground text-center -mt-0.5">Tell us your goals.</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 bg-card/90 border border-border rounded-2xl p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <LayoutDashboard className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-foreground text-center">Get Your Dashboard</span>
                <span className="text-xs text-muted-foreground text-center -mt-0.5">Your tools & guides, ready.</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 bg-card/90 border border-border rounded-2xl p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <Zap className="w-5 h-5 text-success" />
                <span className="text-sm font-semibold text-foreground text-center">Start in Minutes</span>
                <span className="text-xs text-muted-foreground text-center -mt-0.5">Skip the overwhelm.</span>
              </div>
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 4. Features */}
          <section className="relative">
            <div className="grid grid-cols-3 gap-3 h-full">
              <div className="flex flex-col items-center justify-center gap-1.5 bg-card/80 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground text-center">Curated Picks</span>
                <span className="text-xs text-muted-foreground text-center">Only what matters.</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 bg-card/80 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <BookOpen className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-foreground text-center">How‑To Guides</span>
                <span className="text-xs text-muted-foreground text-center">Bite-size steps.</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 bg-card/80 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <Bot className="w-5 h-5 text-success" />
                <span className="text-sm font-semibold text-foreground text-center">Assistant</span>
                <span className="text-xs text-muted-foreground text-center">Personal to you.</span>
              </div>
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 5. Why This Works */}
          <section className="relative">
            <div className="grid grid-cols-3 gap-3 h-full">
              <div className="flex flex-col items-center justify-center gap-1.5 bg-card/80 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground text-center">No AI Experience Required</span>
                <span className="text-xs text-muted-foreground text-center">Start from zero, get results fast.</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 bg-card/80 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <Filter className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-foreground text-center">Skip the Noise</span>
                <span className="text-xs text-muted-foreground text-center">Only see tools relevant to you.</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 bg-card/80 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <Lightbulb className="w-5 h-5 text-success" />
                <span className="text-sm font-semibold text-foreground text-center">Learn While You Work</span>
                <span className="text-xs text-muted-foreground text-center">Grow skills as you use AI daily.</span>
              </div>
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground/80 animate-float absolute -bottom-1 left-1/2 -translate-x-1/2" aria-hidden="true" />
          </section>

          {/* 6. CTA Block */}
          <section className="flex flex-col justify-center">
            <Button onClick={() => setIsWaitlistOpen(true)} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-lg px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all">
              Join the Waitlist
            </Button>
            <p className="mt-2 text-center text-sm text-muted-foreground">Launching soon. Early members get perks.</p>
          </section>
        </div>
      </div>
      
      <WaitlistSignup 
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
};