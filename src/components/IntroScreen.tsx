import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { WaitlistSignup } from "./WaitlistSignup";

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
    <div className="min-h-screen bg-[#f4faff]">
      {/* Desktop Header */}
      <div className="hidden lg:flex sticky top-0 z-50 bg-[#f4faff] px-6 py-3 justify-between items-center">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-light rounded-2xl">
            <img alt="Brain Bytes Logo" className="w-8 h-8 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          </div>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Brain Bytes</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/demo" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Demo
          </Link>
          <button onClick={onAuth} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            Log In
          </button>
          <Button onClick={() => setIsWaitlistOpen(true)} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg">
            Join the Waitlist
          </Button>
        </div>
      </div>

      {/* Mobile & Tablet Header */}
      <div className="lg:hidden bg-[#f4faff] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center flex-1">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-light rounded-2xl mr-3">
              <img alt="Brain Bytes Logo" className="w-6 h-6 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Brain Bytes</span>
          </div>
          <Button variant="outline" onClick={onAuth} className="px-3 py-1 text-sm border-primary/30 hover:bg-primary/10 transition-all duration-300">
            Log In
          </Button>
        </div>
      </div>

      {/* Mobile & Tablet Layout */}
      <div className="lg:hidden px-4 py-4 h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col space-y-4">
          {/* Headline */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-[#1c1c1c] leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Overwhelmed by AI?
              </span>
            </h1>
            
             <p className="text-sm text-slate-600">
               New tools drop every day. Most people don't know where to start.
               That's why we built Brain Bytes — your AI starter kit that cuts through the noise and gives you exactly what you need based on your goals.
             </p>
            
             {/* CTA Button */}
             <div className="space-y-2">
               <Button onClick={() => setIsWaitlistOpen(true)} size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                 → Join the Waitlist — Be First to Access Brain Bytes AI
               </Button>
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">🔐 One-time $29 – No subscriptions</p>
                <p className="text-xs text-muted-foreground">🚀 100% Personalized</p>
                <p className="text-xs text-muted-foreground">🧠 Built by productivity nerds for productivity nerds</p>
              </div>
            </div>

            {/* Demo Link */}
            <div className="text-center mt-2">
              <Link to="/demo" className="text-primary hover:text-accent transition-colors duration-200 font-medium text-xs underline underline-offset-4 hover:underline-offset-2">
                👀 Not ready? Watch a 60-second demo →
              </Link>
            </div>
          </div>

          {/* Quiz Module */}
          <Card className="p-5 bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-lg rounded-xl">
            {renderQuizStep()}
          </Card>
        </div>
        
        {/* Footer Links */}
        <div className="pt-4 pb-2">
          <div className="text-center text-xs text-muted-foreground">
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

      {/* Desktop Layout */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-[#f4faff] via-blue-50/50 to-purple-50/30">
        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black text-[#1c1c1c] leading-[1.05] tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Overwhelmed by AI?
                  </span>
                </h1>
                
                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
                  New tools drop every day. Most people don't know where to start.
                  That's why we built Brain Bytes — your AI starter kit that cuts through the noise and gives you exactly what you need based on your goals.
                </p>
              </div>

              <div className="space-y-6">
                 {/* Enhanced CTA */}
                   <div className="space-y-4">
                    <Button onClick={() => setIsWaitlistOpen(true)} className="relative bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] hover:from-[#6D28D9] hover:via-[#4F46E5] hover:to-[#0891B2] text-white font-semibold text-xl px-10 py-6 rounded-2xl transition-all duration-300 h-auto group overflow-hidden animate-pulse hover:animate-none cursor-pointer hover:scale-105 hover:shadow-2xl hover:-translate-y-1" style={{
                     boxShadow: '0px 4px 18px rgba(0,0,0,0.12), 0 0 20px rgba(124, 58, 237, 0.3)',
                     animation: 'glow 4s ease-in-out infinite alternate'
                   }}>
                     → Join the Waitlist — Be First to Access Brain Bytes AI
                     
                     {/* Shimmer effect on hover */}
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                     </div>
                   </Button>
                   <div className="text-center space-y-1">
                     <p className="text-sm text-muted-foreground">🔐 One-time $29 – No subscriptions</p>
                     <p className="text-sm text-muted-foreground">🚀 100% Personalized</p>
                     <p className="text-sm text-muted-foreground">🧠 Built by productivity nerds for productivity nerds</p>
                   </div>
                 </div>

                {/* Demo Link */}
                <div className="pt-2">
                  <Link to="/demo" className="text-primary hover:text-accent transition-colors duration-200 font-medium text-sm underline underline-offset-4 hover:underline-offset-2">👀 Not ready? Watch a 60-second demo →</Link>
                </div>
              </div>
            </div>

            {/* Right Side - Quiz Module */}
            <div className="lg:ml-8">
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Subtle inner shadow */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-transparent to-slate-100/20 rounded-2xl"></div>
                <div className="relative">
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