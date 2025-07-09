import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Sparkles, Clock, Target } from "lucide-react";

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen = ({ onStart }: IntroScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
            <Clock className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground">Time-Blocked Plan</h3>
            <p className="text-sm text-muted-foreground">Get a structured daily schedule optimized for your workflow</p>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-accent-light to-success-light border-accent/20">
            <Target className="w-8 h-8 text-accent mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground">AI Tool Recommendations</h3>
            <p className="text-sm text-muted-foreground">Discover the perfect tools for your specific needs</p>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-success-light to-primary-light border-success/20">
            <Sparkles className="w-8 h-8 text-success mb-4 mx-auto" />
            <h3 className="font-semibold mb-2 text-foreground">Custom GPT Prompts</h3>
            <p className="text-sm text-muted-foreground">5 personalized prompts to supercharge your productivity</p>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-foreground">
              <Play className="w-4 h-4" />
              <span className="text-sm">45-second demo</span>
            </div>
            <div className="text-muted-foreground">•</div>
            <div className="text-primary font-semibold">$29 one-time</div>
          </div>
          
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start Building Your Plan
          </Button>
          
          <p className="text-muted-foreground text-sm">
            No signup required • Instant results • Download included
          </p>
        </div>
      </div>
    </div>
  );
};