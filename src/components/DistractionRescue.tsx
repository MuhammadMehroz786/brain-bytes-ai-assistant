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
  const [selectedOption, setSelectedOption] = useState<'sprint' | 'reset' | 'easier' | null>(null);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(300); // 5 minutes in seconds
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [sprintCompleted, setSprintCompleted] = useState(false);
  const { toast } = useToast();

  // Sprint timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSprintActive && sprintTimeLeft > 0) {
      interval = setInterval(() => {
        setSprintTimeLeft(prev => {
          if (prev <= 1) {
            setIsSprintActive(false);
            setSprintCompleted(true);
            toast({
              title: "Sprint Complete! 🎉",
              description: "Nice job! You're back in focus.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSprintActive, sprintTimeLeft, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickSprint = () => {
    setSelectedOption('sprint');
    setIsSprintActive(true);
    setSprintTimeLeft(300); // Reset to 5 minutes
    setSprintCompleted(false);
  };

  const handleMentalReset = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe what's distracting you.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      // Mock AI response - in a real app, you'd call your OpenAI endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponses = [
        "I understand that feeling. Sometimes our minds wander when we're feeling overwhelmed. Try breaking your current task into smaller, 10-minute chunks. Focus on just the next small step, not the entire project.",
        "It's completely normal to feel distracted. Take three deep breaths and remind yourself why this task matters to you. What will completing it give you? Hold onto that feeling.",
        "Distractions often signal that we need a moment to reset. Consider this: what would make you feel most accomplished by the end of today? Start there, even if it's just for 15 minutes.",
        "You're not alone in this struggle. Every productive person has moments like these. The fact that you're addressing it shows self-awareness. Now, what's the smallest possible action you can take right now?"
      ];
      
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setAiResponse(response);
      
      toast({
        title: "Mindful Response Ready",
        description: "Take a moment to read this thoughtful perspective.",
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleEasierTask = async () => {
    setSelectedOption('easier');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Mock reordering logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Tasks Reordered",
        description: "Moved the easiest task to the top of your focus stack.",
      });
      
      // Close after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      toast({
        title: "Error",
        description: "Failed to reorder tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetState = () => {
    setSelectedOption(null);
    setSprintTimeLeft(300);
    setIsSprintActive(false);
    setUserInput("");
    setAiResponse("");
    setIsLoadingAI(false);
    setSprintCompleted(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Sprint view
  if (selectedOption === 'sprint') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground">
                Quick Focus Sprint
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
            {sprintCompleted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Sprint Complete!</h3>
                <p className="text-muted-foreground mb-6">Nice job! You're back in focus.</p>
                <Button onClick={handleClose} className="w-full rounded-2xl">
                  Continue Working
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">
                  {formatTime(sprintTimeLeft)}
                </div>
                <p className="text-muted-foreground mb-6">
                  Stay focused for this quick sprint. You've got this!
                </p>
                
                <div className="mb-6">
                  <Progress 
                    value={((300 - sprintTimeLeft) / 300) * 100} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-3">
                  {!isSprintActive ? (
                    <Button 
                      onClick={() => setIsSprintActive(true)} 
                      className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent"
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Start Sprint
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => setIsSprintActive(false)} 
                      className="w-full rounded-2xl"
                    >
                      Pause
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost"
                    onClick={handleClose} 
                    className="w-full rounded-2xl text-muted-foreground"
                  >
                    Cancel Sprint
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mental reset view
  if (selectedOption === 'reset') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground">
                Mental Reset
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
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <p className="text-muted-foreground">
                Let's understand what's pulling your attention away and find a gentle way back to focus.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  What's distracting you right now?
                </label>
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="I'm feeling overwhelmed by..."
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>

              {aiResponse && (
                <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mt-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground leading-relaxed">{aiResponse}</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {!aiResponse ? (
                  <Button 
                    onClick={handleMentalReset} 
                    disabled={!userInput.trim() || isLoadingAI}
                    className="w-full rounded-2xl bg-gradient-to-r from-accent to-primary"
                  >
                    {isLoadingAI ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-pulse" />
                        Getting mindful response...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Get Mindful Response
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleClose} 
                    className="w-full rounded-2xl"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Ready to Refocus
                  </Button>
                )}
                
                <Button 
                  variant="ghost"
                  onClick={handleClose} 
                  className="w-full rounded-2xl text-muted-foreground"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main menu view
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              Feeling Distracted? Let's Get Back On Track
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

        <div className="space-y-4 pt-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-warning" />
            </div>
            <p className="text-muted-foreground">
              It's okay to feel scattered sometimes. Choose your rescue strategy:
            </p>
          </div>

          <div className="grid gap-4">
            {/* Option 1: Quick Focus Sprint */}
            <Card 
              className="p-6 border-2 border-transparent hover:border-primary/20 transition-all duration-300 cursor-pointer group"
              onClick={handleQuickSprint}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Timer className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Quick Focus Sprint</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Start a 5-minute focused work session to build momentum and get back in the zone.
                  </p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Timer className="w-3 h-3 mr-1" />
                    5 minutes
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Option 2: Mental Reset */}
            <Card 
              className="p-6 border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedOption('reset')}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Brain className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Mental Reset</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share what's distracting you and get a thoughtful, personalized reframe to help you refocus.
                  </p>
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    AI-powered guidance
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Option 3: Skip to Easier Task */}
            <Card 
              className="p-6 border-2 border-transparent hover:border-success/20 transition-all duration-300 cursor-pointer group"
              onClick={handleEasierTask}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-2xl flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <List className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Skip to Easier Task</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Reorder your focus stack to start with the smallest, easiest task and build momentum.
                  </p>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Quick wins
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Remember: every productive person has moments like these. You're not alone.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};