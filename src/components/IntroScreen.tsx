import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Sparkles, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}

export const IntroScreen = ({ onStart, onAuth }: IntroScreenProps) => {
  const handleStartBuilding = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) {
        toast.error('Failed to start checkout process');
        return;
      }
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-2">
      {/* Auth buttons - top right */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAuth} 
          className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm border-primary/30 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 text-primary font-semibold shadow-sm"
        >
          Log In
        </Button>
      </div>

      <div className="max-w-6xl mx-auto text-center w-full">
        {/* Header section - compact but centered */}
        <div className="mb-4 md:mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-light rounded-2xl mb-3 md:mb-4">
            <img 
              src="/lovable-uploads/e7fb8ee5-e680-4635-b3ca-22687ca0820b.png" 
              alt="Brain Bytes Logo" 
              className="w-10 h-10 md:w-14 md:h-14 object-contain"
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 md:mb-4 leading-tight">
            Brain Bytes
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
              AI Productivity Assistant
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-3 md:mb-4 max-w-3xl mx-auto leading-relaxed">
            Build your personalized, AI-enhanced daily productivity plan in under 2 minutes
          </p>
        </div>

        {/* Demo button - centered */}
        <div className="flex justify-center mb-3 md:mb-4">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-foreground">
            <Play className="w-4 h-4" />
            <span className="text-sm">45-second demo</span>
          </div>
        </div>

        {/* Pricing section - centered */}
        <div className="flex items-center justify-center gap-3 mb-4 md:mb-5">
          <span className="text-muted-foreground line-through text-base md:text-lg">$45</span>
          <span className="text-2xl md:text-3xl font-bold text-primary">$29</span>
          <span className="text-muted-foreground text-base md:text-lg">one-time</span>
        </div>

        {/* CTA Button - centered and prominent */}
        <div className="mb-5 md:mb-6">
          <Button 
            onClick={handleStartBuilding}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto min-h-[56px]"
          >
            Start Building Your Plan
          </Button>
          
          {/* Supporting text under CTA */}
          <p className="text-muted-foreground text-sm md:text-base mt-3 md:mt-4">
            No recurring fees. One-time purchase. Instantly unlock your AI assistant.
          </p>
        </div>
        {/* What You'll Unlock Section - centered */}
        <div className="mb-6">
          <div className="text-center mb-4 md:mb-5">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-3">
              What You'll Unlock
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Your personalized AI productivity system, built in under 2 minutes.
            </p>
          </div>
          
          {/* Feature blocks container */}
          <div className="bg-muted/30 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border/50">
            {/* Desktop: Horizontal row, Mobile: Stack vertically */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-4">
              <Card className="flex-1 p-4 md:p-5 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
                <Clock className="w-6 h-6 md:w-7 md:h-7 text-primary mb-3 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Your Daily AI Schedule</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Personalized, energy-based schedule optimized for deep focus and goal pacing.</p>
              </Card>
              
              <Card className="flex-1 p-4 md:p-5 bg-gradient-to-br from-accent-light to-success-light border-accent/20">
                <Target className="w-6 h-6 md:w-7 md:h-7 text-accent mb-3 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Smart Productivity Stack</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Hand-picked AI tools with setup guides and starter templates for faster results.</p>
              </Card>
              
              <Card className="flex-1 p-4 md:p-5 bg-gradient-to-br from-success-light to-primary-light border-success/20">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-success mb-3 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Personalized AI Navigator</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Daily focus tips, mini goals, and instant rescue plans based on your working style.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};