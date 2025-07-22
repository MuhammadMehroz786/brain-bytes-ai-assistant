import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FocusTimerProps {
  onExit: () => void;
  onComplete: () => void;
}

export const FocusTimer = ({ onExit, onComplete }: FocusTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isActive, setIsActive] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('focus_sessions')
          .insert({
            user_id: user.id,
            session_type: 'focus',
            duration_minutes: 30,
            started_at: new Date().toISOString(),
            was_completed: false
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating session:', error);
        } else {
          setSessionId(data.id);
        }
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };

    createSession();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !sessionId) return;

      // Update session as completed
      await supabase
        .from('focus_sessions')
        .update({
          completed_at: new Date().toISOString(),
          was_completed: true
        })
        .eq('id', sessionId);

      // Update streak
      await supabase.rpc('update_user_streak', {
        user_id_param: user.id
      });

      toast({
        title: "Great job! Your focus session is complete.",
        description: "Want to reflect or start another session?",
      });

      // Show confetti animation
      showConfetti();
      
      // Call onComplete callback
      onComplete();
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Session completed!",
        description: "Great job on your focus session!",
      });
      onComplete();
    }
  };

  const showConfetti = () => {
    // Simple confetti animation - you could enhance this with a library like react-confetti
    const confettiElement = document.createElement('div');
    confettiElement.innerHTML = '🎉';
    confettiElement.style.position = 'fixed';
    confettiElement.style.top = '50%';
    confettiElement.style.left = '50%';
    confettiElement.style.fontSize = '4rem';
    confettiElement.style.zIndex = '9999';
    confettiElement.style.animation = 'confetti-fall 2s ease-out forwards';
    document.body.appendChild(confettiElement);

    setTimeout(() => {
      document.body.removeChild(confettiElement);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExit = async () => {
    try {
      if (sessionId) {
        // Mark session as incomplete
        await supabase
          .from('focus_sessions')
          .update({
            was_completed: false
          })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
    
    onExit();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-light via-accent-light to-success-light z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExit}
        className="absolute top-4 right-4 bg-foreground/10 hover:bg-foreground/20 text-foreground border-foreground/20 rounded-xl"
      >
        <X className="w-4 h-4 mr-2" />
        Leave Focus Mode
      </Button>

      {/* Main Timer */}
      <Card className="p-8 md:p-12 bg-white/90 backdrop-blur-sm border-primary/20 text-center w-full max-w-md mx-auto">
        <div className="space-y-6 md:space-y-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Focus Mode Started!</h1>
            <p className="text-muted-foreground text-sm md:text-base">Your 30-minute deep work sprint is now running. Minimize distractions—I'll notify you when time's up.</p>
          </div>

          {/* Large Timer Display */}
          <div className="py-6 md:py-8">
            <div className="text-6xl md:text-8xl font-bold text-primary mb-4 font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                style={{ width: `${((30 * 60 - timeLeft) / (30 * 60)) * 100}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setIsActive(!isActive)}
              className="rounded-xl"
            >
              {isActive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Add confetti animation styles */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -70%) scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -100%) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};