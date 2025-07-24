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

  // Calculation logic: tasks per day * 10 minutes / 60 * 20 workdays * hourly rate
  const hoursSavedPerDay = (tasksPerDay[0] * 10) / 60;
  const monthlyHoursSaved = hoursSavedPerDay * 20;
  const monthlyValueGained = monthlyHoursSaved * hourlyRate[0];

  const getProgressPercentage = () => {
    const maxValue = 50 * 10 / 60 * 20 * 500; // 50 tasks * 10 min / 60 * 20 days * $500/hour
    return Math.min((monthlyValueGained / maxValue) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f5ff] via-[#f0f8ff] to-[#ffffff]">
      {/* Desktop Header */}
      <div className="hidden md:flex sticky top-0 z-50 bg-gradient-to-b from-[#f5f5ff] via-[#f0f8ff] to-[#ffffff] backdrop-blur-sm px-6 py-4 justify-between items-center">
        <div className="flex items-center justify-center flex-1">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-2xl mr-4">
            <img alt="Brain Bytes Logo" className="w-8 h-8 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          </div>
          <span className="text-5xl font-bold bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Brain Bytes</span>
        </div>
        <Button variant="outline" onClick={onAuth} className="px-6 py-3 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          Log In
        </Button>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-b from-[#f5f5ff] via-[#f0f8ff] to-[#ffffff] px-4 py-4">
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

      {/* Mobile Layout */}
      <div className="md:hidden px-4 py-2 h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col space-y-3">
          {/* Headline */}
          <div className="text-center space-y-3">
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
              onClick={onStart} 
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
          <Card className="p-3 bg-white/80 backdrop-blur-sm border border-primary/20 shadow-xl rounded-2xl">
            <div className="space-y-3">
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
        <div className="pt-2 pb-2">
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

      {/* Desktop Layout */}
      <div className="hidden md:block px-8 py-8 max-w-7xl mx-auto">
        {/* Centered Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
            Answer 5 questions.
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
              Unlock your personalized AI Assistant
            </span>
            <br />
            in under 2 minutes.
          </h1>
          
          <Button 
            onClick={onStart} 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
          >
            Get Your AI Assistant – $29 One-Time Fee
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-8 items-start">
          {/* Left Side - Demo Video */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              See Brain Bytes in Action
            </h2>
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary-light to-accent-light border border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <iframe 
                src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ" 
                width="100%" 
                height="250" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                className="w-full"
                title="Brain Bytes Demo"
              />
            </div>
          </div>

          {/* Right Side - ROI Sliders */}
          <div>
            <Card className="p-6 bg-gradient-to-br from-white via-primary-light/30 to-accent-light/30 border border-primary/20 shadow-xl rounded-2xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    How many tasks do you complete per day?
                  </label>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>5 tasks</span>
                    <span className="font-semibold text-primary bg-primary-light px-3 py-1 rounded-lg">{tasksPerDay[0]} tasks</span>
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

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    How much is your time worth per hour?
                  </label>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>$10</span>
                    <span className="font-semibold text-primary bg-primary-light px-3 py-1 rounded-lg">${hourlyRate[0]}</span>
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
                <div className="bg-gradient-to-r from-success-light to-primary-light rounded-xl p-4 border border-success/20 shadow-lg">
                  <div className="text-center space-y-3">
                    <p className="text-lg font-semibold text-foreground">
                      You're saving{" "}
                      <span className="text-xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                        ${Math.round(monthlyValueGained).toLocaleString()}
                      </span>
                      /month
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Brain Bytes helps you unlock it for the price of lunch.
                    </p>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-3 mt-3 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-success via-accent to-primary h-3 rounded-full transition-all duration-700 shadow-sm"
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
        </div>

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-gradient-to-br from-primary-light to-accent-light border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">2-Minute Setup</h3>
            <p className="text-sm text-muted-foreground">
              Answer 5 quick questions and get your personalized AI assistant instantly.
            </p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-accent-light to-success-light border-accent/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🧠</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Smart Calendar Sync</h3>
            <p className="text-sm text-muted-foreground">
              Automatically sync your Google Calendar and get AI insights on your schedule.
            </p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-success-light to-primary-light border-success/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-success text-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📧</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Email Summary</h3>
            <p className="text-sm text-muted-foreground">
              Get curated daily email recaps without inbox overload.
            </p>
          </Card>
        </div>

        {/* Testimonials Section */}
        <div className="mt-16 grid grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
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
          
          <Card className="p-6 bg-gradient-to-br from-accent-light to-success-light border-accent/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
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
      </div>

    </div>
  );
};