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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-light rounded-3xl mb-6">
            <img 
              src="/lovable-uploads/e7fb8ee5-e680-4635-b3ca-22687ca0820b.png" 
              alt="Brain Bytes Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Brain Bytes
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
              AI Productivity Assistant
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Build your personalized, AI-enhanced daily productivity plan in under 2 minutes
          </p>
        </div>

        {/* Pricing section */}
        <div className="flex items-center justify-center gap-4 mb-6">
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

        {/* CTA Button - Positioned after pricing, before feature blocks */}
        <div className="mb-6 md:mb-8">
          <Button 
            onClick={handleStartBuilding}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full md:w-auto min-h-[48px]"
          >
            Start Building Your Plan
          </Button>
          
          {/* Supporting text under CTA */}
          <p className="text-muted-foreground text-sm md:text-base mt-6 md:mt-8">
            No recurring fees. One-time purchase. Instantly unlock your AI assistant.
          </p>
        </div>

        {/* What You'll Unlock Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What You'll Unlock
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personalized AI productivity system, built in under 2 minutes.
            </p>
          </div>
          
          {/* Feature blocks container */}
          <div className="bg-muted/30 rounded-3xl p-6 md:p-8 border border-border/50">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
                <Clock className="w-8 h-8 text-primary mb-4 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground">Your Daily AI Schedule</h3>
                <p className="text-sm text-muted-foreground">Your personalized, energy-based schedule — optimized for deep focus, goal pacing, and updated in real time when your day changes.</p>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-accent-light to-success-light border-accent/20">
                <Target className="w-8 h-8 text-accent mb-4 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground">Smart Productivity Stack</h3>
                <p className="text-sm text-muted-foreground">Hand-picked AI tools matched to your habits — complete with setup guides and starter templates to help you get results faster.</p>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-success-light to-primary-light border-success/20">
                <Sparkles className="w-8 h-8 text-success mb-4 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground">Personalized AI Navigator</h3>
                <p className="text-sm text-muted-foreground">Daily focus tips, mini goals, and motivation based on your unique working style — plus instant rescue plans when you get stuck.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};