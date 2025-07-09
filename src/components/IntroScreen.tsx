import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Sparkles, Clock, Target } from "lucide-react";

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen = ({ onStart }: IntroScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start via-gradient-mid to-gradient-end flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AI Productivity
            <br />
            <span className="bg-gradient-to-r from-white via-pastel-blue to-pastel-green bg-clip-text text-transparent">
              Assistant
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build your personalized, AI-enhanced daily productivity plan in under 2 minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <Clock className="w-8 h-8 text-accent mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">Time-Blocked Plan</h3>
            <p className="text-sm opacity-90">Get a structured daily schedule optimized for your workflow</p>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <Target className="w-8 h-8 text-accent mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">AI Tool Recommendations</h3>
            <p className="text-sm opacity-90">Discover the perfect tools for your specific needs</p>
          </Card>
          
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <Sparkles className="w-8 h-8 text-accent mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">Custom GPT Prompts</h3>
            <p className="text-sm opacity-90">5 personalized prompts to supercharge your productivity</p>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Play className="w-4 h-4" />
              <span className="text-sm">45-second demo</span>
            </div>
            <div className="text-white/70">•</div>
            <div className="text-white/90 font-medium">$29 one-time</div>
          </div>
          
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            Start Building Your Plan
          </Button>
          
          <p className="text-white/70 text-sm">
            No signup required • Instant results • Download included
          </p>
        </div>
      </div>
    </div>
  );
};