import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}

export const IntroScreen = ({ onStart, onAuth }: IntroScreenProps) => {
  const [tasksPerDay, setTasksPerDay] = useState([15]);
  const [hourlyRate, setHourlyRate] = useState([50]);
  const [isMobile, setIsMobile] = useState(false);

  const handlePaymentClick = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
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

  // Calculation logic: tasks per day * 10 minutes / 60 * 20 workdays * hourly rate
  const hoursSavedPerDay = (tasksPerDay[0] * 10) / 60;
  const monthlyHoursSaved = hoursSavedPerDay * 20;
  const monthlyValueGained = monthlyHoursSaved * hourlyRate[0];

  const getProgressPercentage = () => {
    const maxValue = 50 * 10 / 60 * 20 * 500; // 50 tasks * 10 min / 60 * 20 days * $500/hour
    return Math.min((monthlyValueGained / maxValue) * 100, 100);
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
          <div className="relative">
            {/* Slow-moving radial gradient background */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-96 h-24 bg-gradient-radial from-purple-400/20 via-blue-400/15 to-cyan-400/10 rounded-full blur-2xl opacity-60 z-0" 
                 style={{ animation: 'float 8s ease-in-out infinite' }}></div>
            
            {/* Primary floating blob behind title - larger and more visible */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-80 h-32 bg-gradient-to-br from-purple-300/50 via-blue-300/50 to-cyan-300/50 rounded-full blur-2xl animate-pulse opacity-70 z-0"></div>
            
            {/* Secondary floating blob - positioned for balance */}
            <div className="absolute -top-6 -right-20 w-24 h-16 bg-gradient-to-br from-indigo-300/40 via-purple-300/40 to-blue-400/40 rounded-full blur-xl animate-bounce opacity-60 z-0"></div>
            
            {/* Tertiary accent blob */}
            <div className="absolute -bottom-4 -left-12 w-16 h-10 bg-gradient-to-br from-cyan-300/30 via-sky-300/30 to-blue-300/30 rounded-full blur-lg opacity-50 z-0" style={{ animation: 'pulse 3s ease-in-out infinite' }}></div>
            
            <div className="relative z-10">
              <span className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent drop-shadow-lg">Brain Bytes</span>
              {/* Hand-drawn scribble underline */}
              <svg className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full h-4" viewBox="0 0 300 20" fill="none">
                <path d="M10 12c20-2 40-4 60-2s40 4 60 2 40-4 60-2 40 4 60 2" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" className="animate-pulse"/>
              </svg>
            </div>
          </div>
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
              Answer 5 questions.
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                Unlock your personalized AI Assistant
              </span>
              <br />
              in under 2 minutes.
            </h1>
            
            {/* CTA Button */}
            <Button 
              onClick={handlePaymentClick} 
              size="sm" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Get Your AI Assistant – $29 One-Time Fee
            </Button>

            {/* Demo Link */}
            <div className="text-center">
              <Link 
                to="/demo" 
                className="text-primary hover:text-accent transition-colors duration-200 font-medium text-xs underline underline-offset-4 hover:underline-offset-2"
              >
                👀 Not ready? Watch a 60-second demo →
              </Link>
            </div>
          </div>

          {/* ROI Sliders */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-xl rounded-2xl">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  How many tasks do you complete per day?
                </label>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>5</span>
                  <span className="font-semibold text-primary bg-primary-light px-2 py-1 rounded-lg text-xs">{tasksPerDay[0]} tasks</span>
                  <span>50</span>
                </div>
                <Slider
                  value={tasksPerDay}
                  onValueChange={setTasksPerDay}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  How much is your time worth per hour?
                </label>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>$10</span>
                  <span className="font-semibold text-primary bg-primary-light px-2 py-1 rounded-lg text-xs">${hourlyRate[0]}</span>
                  <span>$500</span>
                </div>
                <Slider
                  value={hourlyRate}
                  onValueChange={setHourlyRate}
                  min={10}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Live Calculation Display */}
              <div className="bg-gradient-to-r from-success-light to-primary-light rounded-xl p-2 border border-success/20 shadow-lg">
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    You're saving{" "}
                    <span className="text-lg font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                      ${Math.round(monthlyValueGained).toLocaleString()}
                    </span>
                    /month
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Brain Bytes helps you unlock it for the price of lunch.
                  </p>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-success via-accent to-primary h-2 rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on saving 10 minutes per task. Actual savings may vary.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Footer Links */}
        <div className="pt-4 pb-2">
          <div className="flex justify-center gap-4">
            <Link 
              to="/privacy-policy" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Professional Redesign */}
      <div className="hidden lg:block relative overflow-hidden">
        {/* Large floating background blobs for depth */}
        <div className="absolute top-16 left-8 w-[500px] h-[300px] bg-gradient-to-br from-purple-300/25 via-blue-300/25 to-indigo-400/25 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="absolute bottom-20 right-12 w-[400px] h-[250px] bg-gradient-to-br from-cyan-300/20 via-sky-300/20 to-blue-400/20 rounded-full blur-3xl animate-bounce opacity-50" style={{ animationDuration: '8s' }}></div>
        
        {/* Additional accent blobs */}
        <div className="absolute top-1/3 right-1/4 w-32 h-20 bg-gradient-to-br from-lavender-300/30 via-purple-300/30 to-indigo-300/30 rounded-full blur-xl opacity-40" style={{ animation: 'pulse 4s ease-in-out infinite' }}></div>
        
        {/* Curved wave background */}
        <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
            <path d="M0,50 C300,80 600,20 900,50 C1000,60 1100,40 1200,50 L1200,120 L0,120 Z" 
                  fill="url(#waveGradient)" opacity="0.3"/>
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2"/>
                <stop offset="50%" stopColor="#2563EB" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight">
                  Get your time back
                  <br />
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    with AI.
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  #1 AI productivity assistant for{" "}
                  <span className="text-primary font-semibold">individuals</span>,{" "}
                  <span className="text-accent font-semibold">teams</span>, and{" "}
                  <span className="text-success font-semibold">organizations</span>.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  {/* Animated glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-sm opacity-50 animate-pulse"></div>
                  <Button 
                    onClick={handlePaymentClick} 
                    size="lg" 
                    className="relative bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base h-auto"
                  >
                    Get started – $29 one-time fee
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span>100% personalized setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚀</span>
                    <span>2-minute onboarding</span>
                  </div>
                </div>

                <div>
                  <Link 
                    to="/demo" 
                    className="text-primary hover:text-accent transition-colors duration-200 font-medium text-sm underline underline-offset-4 hover:underline-offset-2"
                  >
                    👀 Not ready? Watch a 60-second demo →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Interactive ROI Calculator */}
            <div className="lg:ml-8">
              <div className="bg-white/95 backdrop-blur-sm border border-primary/10 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-500">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Calculate Your Time Savings</h3>
                    <p className="text-sm text-muted-foreground">See how much Brain Bytes can save you</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <span className="text-primary">📋</span>
                        Tasks completed per day
                      </label>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>5</span>
                        <span className="font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{tasksPerDay[0]} tasks</span>
                        <span>50</span>
                      </div>
                      <Slider
                        value={tasksPerDay}
                        onValueChange={setTasksPerDay}
                        min={5}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <span className="text-accent">💰</span>
                        Your time value per hour
                      </label>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>$10</span>
                        <span className="font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">${hourlyRate[0]}</span>
                        <span>$500</span>
                      </div>
                      <Slider
                        value={hourlyRate}
                        onValueChange={setHourlyRate}
                        min={10}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Results Display */}
                    <div className="bg-gradient-to-br from-success/10 via-primary/10 to-accent/10 rounded-2xl p-6 border border-success/20">
                      <div className="text-center space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Monthly time savings value</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-success via-primary to-accent bg-clip-text text-transparent">
                            ${Math.round(monthlyValueGained).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="w-full bg-muted/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-success via-primary to-accent h-2 rounded-full transition-all duration-700"
                              style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Brain Bytes pays for itself in the first week
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to reclaim your time</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Smart automation meets personalized insights to transform how you work
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-primary/10 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Lightning Setup</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Answer 5 questions and get your personalized AI assistant instantly. No complicated configuration.
                </p>
              </div>

              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-accent/10 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Smart Calendar Sync</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Seamlessly connect with Google Calendar for AI-powered scheduling insights and optimization.
                </p>
              </div>

              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-success/10 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-success/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Email Intelligence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get curated daily email summaries without the overwhelm. Focus on what matters most.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by productive professionals</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-lg">★</span>
                    ))}
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
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-lg">★</span>
                    ))}
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
            <div className="flex justify-center gap-8">
              <Link 
                to="/privacy-policy" 
                className="text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};