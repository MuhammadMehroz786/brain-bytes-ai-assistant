import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}
export const IntroScreen = ({
  onStart,
  onAuth
}: IntroScreenProps) => {
  const [tasksPerDay, setTasksPerDay] = useState([15]);
  const [hourlyRate, setHourlyRate] = useState([50]);
  const [isMobile, setIsMobile] = useState(false);
  const [displayedValue, setDisplayedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const handlePaymentClick = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-payment');
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
  const hoursSavedPerDay = tasksPerDay[0] * 10 / 60;
  const monthlyHoursSaved = hoursSavedPerDay * 20;
  const monthlyValueGained = monthlyHoursSaved * hourlyRate[0];
  
  const getProgressPercentage = () => {
    const maxValue = 50 * 10 / 60 * 20 * 500; // 50 tasks * 10 min / 60 * 20 days * $500/hour
    return Math.min(monthlyValueGained / maxValue * 100, 100);
  };

  // Travel comparison logic
  const getTravelComparison = (value: number) => {
    if (value >= 6000) return "That's first-class to the Maldives with overwater bungalows.";
    if (value >= 5000) return "That's a safari in Kenya—flights, lodge, and guide included.";
    if (value >= 4000) return "That's Tokyo + 7 nights in a 4-star hotel.";
    if (value >= 3000) return "That's two weeks island-hopping in Greece.";
    if (value >= 2500) return "That's business class to NYC and back.";
    if (value >= 2000) return "That's a food tour through Italy—Rome, Florence, and Naples.";
    if (value >= 1500) return "That's a ski trip to the Alps.";
    if (value >= 1000) return "That's a weekend in Barcelona—flights and hotel included.";
    return "";
  };

  // Counting animation effect
  useEffect(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const target = Math.round(monthlyValueGained);
    const start = displayedValue;
    const duration = 800; // 800ms animation
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);
      
      setDisplayedValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [monthlyValueGained, isAnimating]);

  // Trigger animation when sliders change
  const handleTasksChange = (value: number[]) => {
    setTasksPerDay(value);
    setIsAnimating(false);
  };

  const handleRateChange = (value: number[]) => {
    setHourlyRate(value);
    setIsAnimating(false);
  };
  return <div className="min-h-screen bg-[#f4faff]">
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
              Answer 5 questions.
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                Unlock your personalized AI Assistant
              </span>
              <br />
              in under 2 minutes.
            </h1>
            
            {/* CTA Button */}
            <Button onClick={handlePaymentClick} size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Get Your AI Assistant – $29 One-Time Fee
            </Button>

            {/* Demo Link */}
            <div className="text-center">
              <Link to="/demo" className="text-primary hover:text-accent transition-colors duration-200 font-medium text-xs underline underline-offset-4 hover:underline-offset-2">
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
                <Slider value={tasksPerDay} onValueChange={handleTasksChange} min={5} max={50} step={1} className="w-full hover:scale-105 transition-transform duration-200" />
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
                <Slider value={hourlyRate} onValueChange={handleRateChange} min={10} max={500} step={10} className="w-full hover:scale-105 transition-transform duration-200" />
              </div>

              {/* Live Calculation Display */}
              <div className="bg-gradient-to-r from-success-light to-primary-light rounded-xl p-2 border border-success/20 shadow-lg">
                <div className="text-center space-y-1">
                   <p className="text-sm font-semibold text-foreground">
                     You're saving{" "}
                     <span className="text-lg font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                       ${displayedValue.toLocaleString()}
                     </span>
                     /month
                   </p>
                   {getTravelComparison(displayedValue) && (
                     <p className="text-xs italic text-muted-foreground/80 transition-opacity duration-500">
                       {getTravelComparison(displayedValue)}
                     </p>
                   )}
                   <p className="text-xs text-muted-foreground font-medium">
                     Brain Bytes helps you unlock it for the price of lunch.
                   </p>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 shadow-inner">
                    <div className="bg-gradient-to-r from-success via-accent to-primary h-2 rounded-full transition-all duration-700 shadow-sm" style={{
                    width: `${getProgressPercentage()}%`
                  }}></div>
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
            <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Professional Redesign */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-[#f4faff] via-blue-50/50 to-purple-50/30">
        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-6 py-12">
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
                {/* 2. Interactive sparkle animation on CTA hover */}
                <div className="relative inline-block">
                  <Button onClick={handlePaymentClick} size="lg" className="relative bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base h-auto group overflow-hidden">
                    Get started – $29 one-time fee
                    {/* Sparkle effect on hover */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rounded-full opacity-0 group-hover:animate-ping group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:animate-pulse group-hover:opacity-100 transition-opacity delay-150 duration-300"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-white/70 rounded-full opacity-0 group-hover:animate-bounce group-hover:opacity-100 transition-opacity delay-75 duration-300"></div>
                  </Button>
                </div>

                {/* 3. "Built with AI" badge */}
                <div className="flex justify-center">
                  
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
                  <Link to="/demo" className="text-primary hover:text-accent transition-colors duration-200 font-medium text-sm underline underline-offset-4 hover:underline-offset-2">
                    👀 Not ready? Watch a 60-second demo →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Interactive ROI Calculator with enhanced 3D depth */}
            <div className="lg:ml-8">
              <div className="bg-gradient-to-br from-white/95 via-purple-50/30 to-blue-50/30 backdrop-blur-sm border border-primary/20 shadow-2xl shadow-primary/10 rounded-3xl p-8 hover:shadow-3xl transition-all duration-500 relative overflow-hidden hover:scale-[1.02]">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-primary/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-foreground">How many repetitive tasks do you handle each day?</h3>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>1 task</span>
                          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{tasksPerDay[0]} tasks</span>
                          <span>50 tasks</span>
                        </div>
                        <Slider value={tasksPerDay} onValueChange={handleTasksChange} min={1} max={50} step={1} className="w-full slider-purple hover:scale-105 transition-transform duration-200" />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground text-center">What's your hourly rate?</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>$10</span>
                          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${hourlyRate[0]}</span>
                          <span>$200</span>
                        </div>
                        <Slider value={hourlyRate} onValueChange={handleRateChange} min={10} max={200} step={10} className="w-full slider-purple hover:scale-105 transition-transform duration-200" />
                      </div>

                       {/* Results Display with enhanced 3D depth */}
                      <div className="bg-gradient-to-br from-purple-100/60 via-blue-100/60 to-purple-100/60 rounded-2xl p-6 border border-primary/30 shadow-2xl shadow-primary/20 relative overflow-hidden">
                        {/* Inner shadow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl"></div>
                        <div className="relative text-center space-y-4">
                          <div>
                            <p className="text-lg font-bold text-foreground mb-1">You're losing <span className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${displayedValue.toLocaleString()}/month</span></p>
                            {getTravelComparison(displayedValue) && (
                              <p className="text-sm italic text-muted-foreground/80 transition-opacity duration-500 mb-2">
                                {getTravelComparison(displayedValue)}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground font-medium">
                              Brain Bytes helps you win it back, for the price of lunch.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Based on saving 10 minutes per task. Actual savings may vary.
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
        </div>

        {/* 5. Gradient divider under hero section */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        {/* How It Works Section */}
        <div className="bg-white/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">How Brain Bytes works in 2 minutes</h2>
            </div>

            <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-8">
              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-primary/20 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white/90 hover:via-purple-50/30 hover:to-blue-50/30">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Answer 5 quick questions</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Get matched with the perfect AI setup in under 2 minutes.
                </p>
              </div>

              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-accent/20 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white/90 hover:via-purple-50/30 hover:to-blue-50/30">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-success text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Activate your assistant</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Sync your calendar, pick your focus tools, and start strong.
                </p>
              </div>

              <div className="group p-8 text-center bg-white/80 backdrop-blur-sm border border-success/20 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white/90 hover:via-purple-50/30 hover:to-blue-50/30">
                <div className="w-20 h-20 bg-gradient-to-br from-success to-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Automate your day</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Get daily briefings, summaries, and saved hours—on autopilot.
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
            <div className="flex justify-center gap-8">
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};