
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
  const [hoursPerWeek, setHoursPerWeek] = useState([10]);
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

  const calculatedValue = hoursPerWeek[0] * hourlyRate[0] * 4;

  const getProgressPercentage = () => {
    const maxValue = 30 * 500 * 4; // 30 hours * $500/hour * 4 weeks
    return Math.min((calculatedValue / maxValue) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sticky Header */}
      <div className="hidden md:flex sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary/10 px-6 py-4 justify-between items-center">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-2xl mr-3">
            <img alt="Brain Bytes Logo" className="w-8 h-8 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          </div>
          <span className="text-xl font-bold text-foreground">Brain Bytes</span>
        </div>
        <Link to="/demo">
          <Button variant="outline" className="bg-white border-primary/30 hover:bg-primary/5 text-primary font-semibold">
            See Demo
          </Button>
        </Link>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-center pt-8 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-2xl mr-4">
          <img alt="Brain Bytes Logo" className="w-10 h-10 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
        </div>
        <span className="text-2xl font-bold text-foreground">Brain Bytes</span>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Side - ROI Sliders (Mobile: full width, Desktop: left column) */}
          <div className="order-2 md:order-1 space-y-6">
            <Card className="p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    How many hours do you waste each week?
                  </label>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>1 hour</span>
                    <span className="font-semibold text-primary">{hoursPerWeek[0]} hours</span>
                    <span>30 hours</span>
                  </div>
                  <Slider
                    value={hoursPerWeek}
                    onValueChange={setHoursPerWeek}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    How much is your time worth per hour?
                  </label>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
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
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10">
                  <div className="text-center space-y-3">
                    <p className="text-lg font-semibold text-foreground">
                      You're losing{" "}
                      <span className="text-2xl font-bold text-destructive">
                        ${calculatedValue.toLocaleString()}
                      </span>
                      /month
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Brain Bytes helps you win it back.
                    </p>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                      <div 
                        className="bg-gradient-to-r from-warning to-destructive h-3 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Monthly productivity loss visualization
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
