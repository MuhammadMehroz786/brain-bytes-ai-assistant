import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Brain, ArrowRight, X, Timer, MessageCircle, List, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DistractionRescueProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DistractionRescue = ({ isOpen, onClose }: DistractionRescueProps) => {
  const [step, setStep] = useState<'ask' | 'coaching' | 'followup'>('ask');
  const [userInput, setUserInput] = useState("");
  const [coachingResponse, setCoachingResponse] = useState("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const { toast } = useToast();

  const generateCoachingResponse = (input: string) => {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('email') || inputLower.includes('inbox')) {
      return "Overwhelmed by emails is normal. Let's contain it: Set a 10-minute timer, reply to only 3 urgent messages, then close your inbox. You'll feel lighter without losing your flow.";
    }
    
    if (inputLower.includes('social media') || inputLower.includes('phone') || inputLower.includes('scroll')) {
      return "Thanks for being honest! Put your phone in another room for 30 mins or try the Focus Mode timer right now. Let's protect your brain space.";
    }
    
    if (inputLower.includes('stress') || inputLower.includes('anxious') || inputLower.includes('worry') || inputLower.includes('thoughts')) {
      return "Got it. Open your Brain Dump and write down everything on your mind for 2 minutes. That will clear mental space so you can focus again.";
    }
    
    if (inputLower.includes('tired') || inputLower.includes('energy') || inputLower.includes('sleepy')) {
      return "Your energy is signaling something important. Take a 5-minute walk or do 10 jumping jacks to reset your system. Sometimes we need to move before we can focus.";
    }
    
    if (inputLower.includes('meeting') || inputLower.includes('people') || inputLower.includes('interruption')) {
      return "Interruptions break flow, but you can reclaim it. Block 30 minutes on your calendar right now and put on noise-canceling headphones. Guard your focus like it's precious—because it is.";
    }
    
    // Default response for other distractions
    return "I hear you. Distractions are normal, but recognizing them shows self-awareness. Try this: take 3 deep breaths, remind yourself why this work matters to you, then tackle just the next 15 minutes. You've got this.";
  };

  const handleSubmitDistraction = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Tell me more",
        description: "Please describe what's pulling your focus away.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingResponse(true);
    
    // Simulate thinking time for more natural feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = generateCoachingResponse(userInput);
    setCoachingResponse(response);
    setStep('coaching');
    setIsLoadingResponse(false);
  };

  const handleLogDistraction = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && userInput.trim()) {
        // In a real app, you'd log this to a distractions table
        toast({
          title: "Distraction logged",
          description: "This will help us spot patterns and improve your focus over time.",
        });
      }
    } catch (error) {
      console.error('Error logging distraction:', error);
    }
    
    handleClose();
  };

  const resetState = () => {
    setStep('ask');
    setUserInput("");
    setCoachingResponse("");
    setIsLoadingResponse(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Step 1: Ask what's distracting
  if (step === 'ask') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground">
                Let's Get You Back on Track
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                What's pulling your focus away right now?
              </h3>
              <p className="text-muted-foreground text-sm">
                Be specific so I can give you the most helpful guidance.
              </p>
            </div>

            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="I'm getting distracted by emails / social media / my phone / random thoughts..."
              className="rounded-xl resize-none min-h-[100px]"
              rows={4}
            />

            <div className="space-y-3">
              <Button 
                onClick={handleSubmitDistraction} 
                disabled={!userInput.trim() || isLoadingResponse}
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent"
              >
                {isLoadingResponse ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Getting your personalized coaching...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Get My Coaching Response
                  </>
                )}
              </Button>
              
              <Button 
                variant="ghost"
                onClick={handleClose} 
                className="w-full rounded-2xl text-muted-foreground"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Show coaching response
  if (step === 'coaching') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground">
                Your Personal Coach
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mt-1">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed">{coachingResponse}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={() => setStep('followup')} 
                className="w-full rounded-2xl bg-gradient-to-r from-success to-primary"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                This Helps - Let's Move Forward
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setStep('ask')} 
                className="w-full rounded-2xl"
              >
                Let Me Try Describing It Differently
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 3: Follow-up action
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              One More Thing
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <p className="text-muted-foreground">
              Would you like me to log this distraction to help spot patterns later?
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleLogDistraction} 
              className="w-full rounded-2xl bg-gradient-to-r from-success to-primary"
            >
              Yes, Log This Pattern
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleClose} 
              className="w-full rounded-2xl"
            >
              No Thanks, Just Get Back to Work
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};