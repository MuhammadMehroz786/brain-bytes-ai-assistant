import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Sparkles, Clock, Target } from "lucide-react";

interface IntroScreenProps {
  onStart: () => void;
  onAuth: () => void;
}

export const IntroScreen = ({ onStart, onAuth }: IntroScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Auth buttons - top right */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="ghost" size="sm" onClick={onAuth}>
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

        {/* Mobile CTA - show at top on mobile */}
        <div className="block md:hidden mb-8">
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full"
          >
            Start Building Your Plan
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
            <Clock className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground">Time-Blocked Productivity Blueprint</h3>
            <p className="text-sm text-muted-foreground">Your personalized, AI-generated daily schedule — crafted to optimize energy levels, focus zones, and goal pacing</p>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-accent-light to-success-light border-accent/20">
            <Target className="w-8 h-8 text-accent mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground">Custom AI Stack Recommendation</h3>
            <p className="text-sm text-muted-foreground">Hand-selected AI tools tailored to your habits, goals, and productivity style — complete with usage tips</p>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-success-light to-primary-light border-success/20">
            <Sparkles className="w-8 h-8 text-success mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground">5 Precision-Crafted GPT Prompts</h3>
            <p className="text-sm text-muted-foreground">Personalized GPT prompts designed to help you write faster, think clearer, and execute smarter</p>
          </Card>
        </div>

        <div className="space-y-6">
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
          
          {/* Desktop CTA - hidden on mobile */}
          <div className="hidden md:block">
            <Button 
              onClick={onStart}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Building Your Plan
            </Button>
          </div>
          
          <p className="text-muted-foreground text-sm">
            Exclusive for Brain Bytes Subscribers • Answer 5 quick questions • Instantly unlock your personalized AI productivity system
          </p>
        </div>
      </div>
    </div>
  );
};