import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    helpWith: "",
    experience: "",
    frustration: ""
  });

  const handlePaymentClick = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

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
    return `We'll build your AI Assistant to help you ${helpWithText.toLowerCase()}. You don't need to figure it all out — we'll guide you step by step.`;
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return answers.helpWith !== "";
      case 2: return answers.experience !== "";
      case 3: return answers.frustration !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(4); // Show result
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderQuizStep = () => {
    if (currentStep === 4) {
      return (
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Perfect! Here's what's next:</h3>
            <p className="text-muted-foreground leading-relaxed">
              {getPersonalizedMessage()}
            </p>
          </div>
          <Button 
            onClick={handlePaymentClick}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-6 py-3 rounded-xl"
          >
            Join the Waitlist – Get Early Access
          </Button>
        </div>
      );
    }

    const questions = [
      {
        title: "What do you want AI to help you with?",
        options: [
          "Create content faster",
          "Stay organized", 
          "Automate tasks",
          "Learn new tools",
          "Not sure yet"
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
          "No time to learn",
          "Haven't started yet"
        ],
        key: "frustration" as keyof QuizAnswers
      }
    ];

    const currentQuestion = questions[currentStep - 1];

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <h3 className="text-lg font-bold text-foreground">{currentQuestion.title}</h3>
        </div>

        <RadioGroup
          value={answers[currentQuestion.key]}
          onValueChange={(value) => setAnswers({ ...answers, [currentQuestion.key]: value })}
          className="space-y-3"
        >
          {currentQuestion.options.map((option) => (
            <div key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={!isStepComplete()}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {currentStep === 3 ? "Show My Starter Plan" : "Next"}
          </Button>
        </div>
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
        <Button variant="outline" onClick={onAuth} className="px-4 py-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          Log In
        </Button>
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
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Are you overwhelmed by{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                AI?
              </span>
            </h1>
            
            <p className="text-base text-muted-foreground">
              Your personalized AI starter kit — no overwhelm, no confusion, just tools that match your goals.
            </p>
            
            {/* CTA Button */}
            <div className="space-y-2">
              <Button onClick={handlePaymentClick} size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Join the Waitlist – Be first to access Brain Bytes AI
              </Button>
              <p className="text-xs text-muted-foreground">
                Launching soon. One-time $29 fee.
              </p>
            </div>

            {/* Demo Link */}
            <div className="text-center mt-2">
              <Link to="/demo" className="text-primary hover:text-accent transition-colors duration-200 font-medium text-xs underline underline-offset-4 hover:underline-offset-2">
                👀 Not ready? Watch a 60-second demo →
              </Link>
            </div>
          </div>

          {/* Quiz Module */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-xl rounded-2xl">
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
            <div className="space-y-12">
              <div className="space-y-8">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black text-foreground leading-[1.05] tracking-tight">
                  Are you overwhelmed by{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    AI?
                  </span>
                </h1>
                
                <p className="text-2xl lg:text-3xl text-muted-foreground leading-relaxed max-w-2xl">
                  Your personalized AI starter kit — no overwhelm, no confusion, just tools that match your goals.
                </p>
              </div>

              <div className="space-y-8">
                {/* Enhanced CTA */}
                <div className="space-y-4">
                  <Button onClick={handlePaymentClick} className="relative bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] hover:from-[#6D28D9] hover:via-[#4F46E5] hover:to-[#0891B2] text-white font-semibold text-xl px-10 py-6 rounded-2xl transition-all duration-300 h-auto group overflow-hidden animate-pulse hover:animate-none cursor-pointer hover:scale-105 hover:shadow-2xl hover:-translate-y-1" style={{
                    boxShadow: '0px 4px 18px rgba(0,0,0,0.12), 0 0 20px rgba(124, 58, 237, 0.3)',
                    animation: 'glow 4s ease-in-out infinite alternate'
                  }}>
                    Join the Waitlist – Be first to access Brain Bytes AI
                    
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                  </Button>
                  <p className="text-base text-muted-foreground/80 border-b border-muted-foreground/20 pb-2 inline-block">
                    Launching soon. One-time $29 fee.
                  </p>
                </div>

                {/* Demo Link */}
                <div className="pt-2">
                  <Link to="/demo" className="text-primary hover:text-accent transition-colors duration-200 font-medium text-sm underline underline-offset-4 hover:underline-offset-2">👀 Not ready? Watch a 60-second demo →</Link>
                </div>
              </div>
            </div>

            {/* Right Side - Quiz Module */}
            <div className="lg:ml-8">
              <div className="bg-gradient-to-br from-white/95 via-purple-50/30 to-blue-50/30 backdrop-blur-sm border border-primary/20 shadow-2xl shadow-primary/10 rounded-3xl p-8 hover:shadow-3xl transition-all duration-500 relative overflow-hidden hover:scale-[1.02]">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-primary/5 rounded-3xl"></div>
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
    </div>
  );
};