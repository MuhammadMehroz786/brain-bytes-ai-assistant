import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Sparkles, Clock, Target, Calendar } from "lucide-react";
interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}
export const IntroScreen = ({
  onStart,
  onAuth
}: IntroScreenProps) => {
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setShowStickyButton(scrollPosition > windowHeight * 0.3);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-2 md:p-4">
      {/* Auth buttons - top right */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 flex gap-2">
        <Button variant="outline" size={isMobile ? "sm" : "lg"} onClick={onAuth} className="bg-white/95 backdrop-blur-sm border-primary/30 hover:bg-white text-primary font-semibold px-3 md:px-6 py-1.5 md:py-2 shadow-md hover:shadow-lg transition-all duration-200 text-sm md:text-base">
          Log In
        </Button>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-4 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-primary-light rounded-3xl mb-3 md:mb-6">
            <img alt="Brain Bytes Logo" className="w-10 h-10 md:w-16 md:h-16 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-6 leading-tight">
            Brain Bytes
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
              AI Productivity Assistant
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Build your personalized, AI-enhanced daily productivity plan in under 2 minutes
          </p>
        </div>

        {/* Mobile CTA - moved up on mobile */}
        <div className="block md:hidden mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through text-xs">$45</span>
                <span className="text-primary font-bold text-base">$29</span>
                <span className="text-muted-foreground text-xs">one-time</span>
              </div>
            </div>
            <Button onClick={onStart} size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full">
              Unlock my AI Assistant
            </Button>
          </div>
        </div>

        {/* New Three Column Layout */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Left Box - Calendar Sync */}
          <Card className="p-4 md:p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20 order-2 md:order-1">
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3 md:mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Smart Calendar Integration</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Sync your Google Calendar in seconds and get a clear view of your daily events directly inside your AI dashboard. No more switching tabs — your schedule lives where your productivity happens.</p>
          </Card>
          
          {/* Center Column - YouTube Video */}
          <div className="order-1 md:order-2">
            <div className="rounded-xl overflow-hidden bg-black/5 border border-primary/10">
              <iframe src="https://www.youtube.com/embed/bWi86lZyyX8" width="100%" height="200" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-48 md:h-56" />
            </div>
          </div>
          
          {/* Right Box - Email Summary */}
          <Card className="p-4 md:p-6 bg-gradient-to-br from-accent-light to-success-light border-accent/20 order-3">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent mb-3 md:mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Curated Email Recap</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Automatically pull in and summarize your daily emails, helping you stay on top of what matters. Access your recap right from your dashboard — no inbox overload.</p>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="hidden md:flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground line-through text-sm">$45</span>
              <span className="text-primary font-bold text-lg">$29</span>
              <span className="text-muted-foreground text-sm">one-time</span>
            </div>
          </div>
          
          {/* Desktop CTA - hidden on mobile, increased size */}
          <div className="hidden md:block">
            <Button onClick={onStart} size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-xl px-20 py-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Unlock my AI Assistant
            </Button>
          </div>
          
          <p className="text-muted-foreground text-xs md:text-sm">
            Exclusive for Brain Bytes Subscribers • Answer 5 quick questions • Instantly unlock your personalized AI productivity system
          </p>
        </div>
      </div>

      {/* Sticky CTA Button for Mobile */}
      {showStickyButton && <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <Button onClick={scrollToTop} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 rounded-xl shadow-lg">
            Unlock my AI Assistant – $29
          </Button>
        </div>}
    </div>;
};