
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";

interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}

export const IntroScreen = ({ onStart, onAuth }: IntroScreenProps) => {
  const [tasksPerDay, setTasksPerDay] = useState([15]);
  const [hourlyRate, setHourlyRate] = useState([50]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // New calculation logic: tasks per day * 10 minutes / 60 * 20 workdays * hourly rate
  const hoursSavedPerDay = (tasksPerDay[0] * 10) / 60;
  const monthlyHoursSaved = hoursSavedPerDay * 20;
  const monthlyValueGained = monthlyHoursSaved * hourlyRate[0];

  const getProgressPercentage = () => {
    const maxValue = 50 * 10 / 60 * 20 * 500; // 50 tasks * 10 min / 60 * 20 days * $500/hour
    return Math.min((monthlyValueGained / maxValue) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sticky Header */}
      <div className="hidden md:flex sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary/10 px-6 py-4">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-2xl mr-3">
            <img alt="Brain Bytes Logo" className="w-8 h-8 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          </div>
          <span className="text-xl font-bold text-foreground">Brain Bytes</span>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-2xl mr-3">
            <img alt="Brain Bytes Logo" className="w-8 h-8 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          </div>
          <span className="text-xl font-bold text-foreground">Brain Bytes</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Left Side - ROI Sliders (Mobile: full width, Desktop: left column) */}
          <div className="order-2 md:order-1">
            <Card className="p-4 md:p-6 bg-white border border-border shadow-sm rounded-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    How many tasks do you complete per day?
                  </label>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>5 tasks</span>
                    <span className="font-semibold text-primary">{tasksPerDay[0]} tasks</span>
                    <span>50 tasks</span>
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
                    <span className="font-semibold text-primary">${hourlyRate[0]}</span>
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
                <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
                  <div className="text-center space-y-3">
                    <p className="text-lg font-semibold text-foreground">
                      You're saving{" "}
                      <span className="text-xl font-bold text-success">
                        ${Math.round(monthlyValueGained).toLocaleString()}
                      </span>
                      /month
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Brain Bytes helps you unlock it for the price of lunch.
                    </p>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-success to-primary h-2 rounded-full transition-all duration-500"
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

          {/* Right Side - Value Prop & CTA (Mobile: above sliders, Desktop: right column) */}
          <div className="order-1 md:order-2 space-y-6 text-center md:text-left">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Answer 5 questions.
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                  Unlock your personalized AI Assistant
                </span>
                <br />
                in under 2 minutes.
              </h1>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={onStart} 
                size="lg" 
                className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Your AI Assistant – $29 One-Time
              </Button>
              
              <div className="flex justify-center md:justify-start">
                <Link 
                  to="/demo" 
                  className="text-primary hover:text-accent transition-colors duration-200 font-medium text-sm underline underline-offset-4"
                >
                  👀 Not ready? Watch a 60-second demo →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Below the Fold Content - Desktop Only */}
        <div className="hidden md:block mt-16 space-y-12">
          {/* Demo Video Section */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              See Brain Bytes in Action
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="rounded-xl overflow-hidden bg-black/5 border border-primary/10 shadow-lg">
                <iframe 
                  src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ" 
                  width="100%" 
                  height="400" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  className="w-full"
                  title="Brain Bytes Demo"
                />
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Brain Bytes transformed my daily routine. I'm saving 2+ hours every day and finally feel in control of my schedule."
                </p>
                <div className="text-xs text-muted-foreground font-medium">
                  — Sarah M., Marketing Director
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-accent-light to-success-light border-accent/20">
              <div className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "The personalized AI insights are incredible. It's like having a productivity coach that actually understands my workflow."
                </p>
                <div className="text-xs text-muted-foreground font-medium">
                  — David L., Software Engineer
                </div>
              </div>
            </Card>
          </div>

          {/* Repeated CTA */}
          <div className="text-center">
            <Button 
              onClick={onStart} 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Your AI Assistant – $29 One-Time
            </Button>
          </div>
        </div>
      </div>

      {/* Privacy Policy and Terms Links - Bottom */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        <Link 
          to="/privacy-policy" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 underline"
        >
          Privacy Policy
        </Link>
        <Link 
          to="/terms-of-service" 
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 underline"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
};
