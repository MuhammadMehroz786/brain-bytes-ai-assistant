import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Sparkles, Clock, Target } from "lucide-react";

interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}

export const IntroScreen = ({ onStart, onAuth }: IntroScreenProps) => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-2 md:p-4">
      {/* Auth buttons - top right */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 flex gap-2">
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "lg"}
          onClick={onAuth} 
          className="bg-white/95 backdrop-blur-sm border-primary/30 hover:bg-white text-primary font-semibold px-3 md:px-6 py-1.5 md:py-2 shadow-md hover:shadow-lg transition-all duration-200 text-sm md:text-base"
        >
          Log In
        </Button>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-4 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-primary-light rounded-3xl mb-3 md:mb-6">
            <img 
              src="/lovable-uploads/e7fb8ee5-e680-4635-b3ca-22687ca0820b.png" 
              alt="Brain Bytes Logo" 
              className="w-10 h-10 md:w-16 md:h-16 object-contain"
            />
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

        {/* Mobile CTA, Demo, Pricing - moved up on mobile */}
        <div className="block md:hidden mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 text-foreground">
                <Play className="w-3 h-3" />
                <span className="text-xs">45-second demo</span>
              </div>
              <div className="text-muted-foreground text-xs">•</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through text-xs">$45</span>
                <span className="text-primary font-bold text-base">$29</span>
                <span className="text-muted-foreground text-xs">one-time</span>
              </div>
            </div>
            <Button 
              onClick={onStart}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full"
            >
              Unlock My AI Plan
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="p-4 md:p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary mb-3 md:mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Your Daily AI Schedule</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Your personalized, energy-based schedule — optimized for deep focus, goal pacing, and updated in real time when your day changes.</p>
          </Card>
          
          <Card className="p-4 md:p-6 bg-gradient-to-br from-accent-light to-success-light border-accent/20">
            <Target className="w-6 h-6 md:w-8 md:h-8 text-accent mb-3 md:mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Smart Productivity Stack</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Hand-picked AI tools matched to your habits — complete with setup guides and starter templates to help you get results faster.</p>
          </Card>
          
          <Card className="p-4 md:p-6 bg-gradient-to-br from-success-light to-primary-light border-success/20">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-success mb-3 md:mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Personalized AI Navigator</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Daily focus tips, mini goals, and motivation based on your unique working style — plus instant rescue plans when you get stuck.</p>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="hidden md:flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-foreground">
              <Play className="w-4 h-4" />
              <span className="text-sm">45-second demo</span>
            </div>
            <div className="text-muted-foreground">•</div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground line-through text-sm">$45</span>
              <span className="text-primary font-bold text-lg">$29</span>
              <span className="text-muted-foreground text-sm">one-time</span>
            </div>
          </div>
          
          {/* Desktop CTA - hidden on mobile, increased size */}
          <div className="hidden md:block">
            <Button 
              onClick={onStart}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-xl px-20 py-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Unlock My AI Plan
            </Button>
          </div>
          
          <p className="text-muted-foreground text-xs md:text-sm">
            Exclusive for Brain Bytes Subscribers • Answer 5 quick questions • Instantly unlock your personalized AI productivity system
          </p>
        </div>
      </div>

      {/* Sticky CTA Button for Mobile */}
      {showStickyButton && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <Button 
            onClick={scrollToTop}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-4 rounded-xl shadow-lg"
          >
            Unlock My AI Plan – $29
          </Button>
        </div>
      )}
    </div>
  );
};