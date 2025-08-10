import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { WaitlistSignup } from "./WaitlistSignup";
import { ArrowDown, CheckCircle2, BookOpen, Bot, LayoutDashboard, ListChecks, Zap } from "lucide-react";

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
    <div className="min-h-[100dvh] overflow-hidden lg:overflow-visible bg-[#f4faff]">
      {/* Desktop Header */}
      <div className="hidden lg:flex sticky top-0 z-50 bg-gradient-to-r from-[#F6F0FF] to-[#EAF7FF] backdrop-blur-md border-b border-slate-200/60 px-6 py-2 justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-light rounded-xl">
            <img alt="Brain Bytes Logo" className="w-6 h-6 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Brain Bytes</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/demo" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
            Demo
          </Link>
          <Link to="/contact" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
            Contact
          </Link>
          <button onClick={onAuth} className="text-sm text-foreground hover:text-primary transition-colors duration-200">
            Sign In
          </button>
          <Button onClick={() => setIsWaitlistOpen(true)} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg text-sm">
            Join Waitlist
          </Button>
        </div>
      </div>

      {/* Mobile & Tablet Header */}
      <header className="lg:hidden h-14 bg-gradient-to-r from-primary-light to-accent-light backdrop-blur-sm border-b border-border px-4 shadow-md">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Brain Bytes
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground/80 border border-border">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onAuth} className="h-8 px-3 text-xs rounded-xl bg-card text-foreground shadow-sm hover:bg-secondary">
              Sign In
            </Button>
            <Button onClick={() => setIsWaitlistOpen(true)} className="h-8 px-3 text-xs rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </header>

      <main className="lg:hidden h-[calc(100dvh-56px-48px)] bg-primary-light/60 overflow-x-hidden overflow-y-hidden">
        {/* Hero Section */}
        <section className="px-6 pt-5 pb-3 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Overwhelmed by AI?</h1>
          <p className="mt-2 text-sm text-muted-foreground">We solve it for the price of lunch.</p>
          <ArrowDown className="h-4 w-4 text-muted-foreground animate-float mx-auto mt-1" aria-hidden="true" />
          <p className="mt-1 text-[11px] text-muted-foreground">Hand-picked tools and steps, tested by the Brain Bytes team.</p>
        </section>
        {/* 1) First Section: Three-step row */}
        <section className="px-6 pt-2 pb-1 flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 bg-card/90 border border-border rounded-2xl p-3 shadow-sm">
              <ListChecks className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-medium text-foreground text-center">Answer 5 Questions</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-card/90 border border-border rounded-2xl p-3 shadow-sm">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-medium text-foreground text-center">Get Your Dashboard</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-card/90 border border-border rounded-2xl p-3 shadow-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-medium text-foreground text-center">Start in Minutes</span>
            </div>
          </div>
          <ArrowDown className="h-4 w-4 text-muted-foreground animate-float mx-auto mt-1" aria-hidden="true" />
        </section>

        {/* 2) Second Section: Video + caption */}
        <section className="px-6 pb-2 flex flex-col justify-between">
          <figure className="rounded-xl overflow-hidden border border-border shadow-sm bg-card">
            <iframe
              src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ"
              width="100%"
              height="160"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video"
              title="Brain Bytes Demo"
            />
          </figure>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">See what you’ll get</p>
          <a href="#join-cta" className="mt-1 inline-block text-center text-[11px] text-muted-foreground hover:text-primary underline underline-offset-2">Get early access →</a>
          <ArrowDown className="h-4 w-4 text-muted-foreground animate-float mx-auto mt-1" aria-hidden="true" />
        </section>

        {/* 3) Third Section: Feature row */}
        <section className="px-6 pb-2 flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-semibold text-foreground text-center">Curated Picks</span>
              
            </div>
            <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-semibold text-foreground text-center">How‑To Guides</span>
              
            </div>
            <div className="flex flex-col items-center gap-1 bg-card/80 border border-border rounded-2xl p-3 shadow-sm">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-semibold text-foreground text-center">Your AI Assistant</span>
              
            </div>
          </div>
          <ArrowDown className="h-4 w-4 text-muted-foreground animate-float mx-auto mt-1" aria-hidden="true" />
        </section>

        {/* 4) Fourth Section: CTA */}
        <section className="px-6 pb-4 flex flex-col justify-center">
          <Button id="join-cta" onClick={() => setIsWaitlistOpen(true)} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-lg px-6 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all">
            Join the Waitlist
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Launch price: $29 (less than lunch).</p>
          <p className="mt-1 text-center text-[10px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </section>
      </main>

      {/* Mobile Footer */}
      <footer className="lg:hidden px-4 pb-4 bg-primary-light/60">
        <div className="text-[10px] text-muted-foreground text-center">
          © 2025 Brain Bytes · <Link to="/privacy-policy" className="hover:text-primary">Privacy</Link> · <Link to="/terms-of-service" className="hover:text-primary">Terms</Link> · <Link to="/refund-policy" className="hover:text-primary">Refund</Link> · <Link to="/cookie-policy" className="hover:text-primary">Cookies</Link> · <Link to="/contact" className="hover:text-primary">Contact</Link>
        </div>
      </footer>

      {/* Desktop Layout */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-[#F6F0FF] to-[#EAF7FF]">
        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            {/* Left Side - Hero Content */}
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black text-[#1c1c1c] leading-[1.05] tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Overwhelmed by AI?
                  </span>
                </h1>
                
                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
                  There are too many tools. Most aren't worth your time.<br />
                  Brain Bytes helps you find the ones that are — with curated picks, how-to guides, and a productivity assistant to cut through the noise.
                </p>
              </div>

              <div className="space-y-8">
                {/* Feature Badge Header */}
                <div className="text-center">
                  <p className="text-base text-slate-500 font-medium mb-4">What you get inside Brain Bytes:</p>
                </div>

                {/* Feature Badges Group */}
                <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 animate-fade-in">
                  <div className="flex flex-col items-center gap-3 group bg-white/70 border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover-scale transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/15 to-accent/15 flex items-center justify-center text-2xl">✅</div>
                    <span className="text-sm font-semibold text-slate-700 text-center">Curated Tool Picks</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 group bg-white/70 border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover-scale transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/15 to-accent/15 flex items-center justify-center text-2xl">📘</div>
                    <span className="text-sm font-semibold text-slate-700 text-center">How‑To Guides</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 group bg-white/70 border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover-scale transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/15 to-accent/15 flex items-center justify-center text-2xl">🧠</div>
                    <span className="text-sm font-semibold text-slate-700 text-center">Productivity Assistant</span>
                  </div>
                </div>

                {/* Enhanced CTA */}
                <div className="space-y-8 pt-4">
                  <Button onClick={() => setIsWaitlistOpen(true)} className="relative w-full max-w-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-xl px-8 py-6 rounded-2xl transition-all duration-300 h-auto group overflow-hidden hover:shadow-2xl hover:-translate-y-0.5">
                    → Join the Waitlist
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                  </Button>
                </div>

                {/* Demo Link with Pricing */}
                <div className="pt-4 text-center space-y-3">
                  <Link to="/demo" className="text-primary hover:text-accent transition-colors duration-200 font-medium text-sm underline underline-offset-4 hover:underline-offset-2 block">👀 Not ready? Watch a 60-second demo →</Link>
                  <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground">One-time $29 – No subscriptions</p>
                    <p className="text-sm text-muted-foreground">100% Personalized</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Quiz Module */}
            <div className="lg:ml-8">
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Subtle inner shadow */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-transparent to-slate-100/20 rounded-2xl"></div>
                <div className="relative">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Help us personalize your experience</h3>
                    <p className="text-sm text-slate-600">Answer a few quick questions to get started</p>
                  </div>
                  {renderQuizStep()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient divider under hero section */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        {/* How It Works Section - Desktop Only */}
        <div className="hidden lg:block bg-white/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">How Brain Bytes works in 2 minutes</h2>
            </div>

            <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-8">
              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-primary/20 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white/90 hover:via-purple-50/30 hover:to-blue-50/30">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Answer 3 quick questions</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Get instantly matched with your ideal AI setup—zero fluff, just fast results.
                </p>
              </div>

              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-accent/20 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white/90 hover:via-purple-50/30 hover:to-blue-50/30">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-success text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Get your starter kit</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Receive a curated set of AI tools and guides tailored to your specific needs.
                </p>
              </div>

              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-success/20 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white/90 hover:via-purple-50/30 hover:to-blue-50/30">
                <div className="w-20 h-20 bg-gradient-to-br from-success to-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Start saving time</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Begin using AI effectively with confidence and clear guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof - Desktop Only */}
        <div className="hidden lg:block py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by productive professionals</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-lg">★</span>)}
                  </div>
                  <p className="text-foreground leading-relaxed">
                    "Brain Bytes transformed my daily routine. I'm saving 2+ hours every day and finally feel in control of my schedule."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">SM</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Sarah M.</div>
                      <div className="text-sm text-muted-foreground">Marketing Director</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-accent/10 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-500 text-lg">★</span>)}
                  </div>
                  <p className="text-foreground leading-relaxed">
                    "The personalized AI insights are incredible. It's like having a productivity coach that actually understands my workflow."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold">DL</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">David L.</div>
                      <div className="text-sm text-muted-foreground">Software Engineer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/30 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center text-muted-foreground">
              © 2025 Brain Bytes | 
              <Link to="/privacy-policy" className="hover:text-primary transition-colors duration-200 mx-1">
                Privacy Policy
              </Link> | 
              <Link to="/terms-of-service" className="hover:text-primary transition-colors duration-200 mx-1">
                Terms of Service
              </Link> | 
              <Link to="/refund-policy" className="hover:text-primary transition-colors duration-200 mx-1">
                Refund Policy
              </Link> | 
              <Link to="/cookie-policy" className="hover:text-primary transition-colors duration-200 mx-1">
                Cookie Policy
              </Link> | 
              <Link to="/contact" className="hover:text-primary transition-colors duration-200 mx-1">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <WaitlistSignup 
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
};