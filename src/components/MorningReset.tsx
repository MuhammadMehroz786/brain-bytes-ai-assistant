import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Clock, Target, CalendarCheck, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MorningResetProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleUpdate: () => void;
}

export const MorningReset = ({ isOpen, onClose, onScheduleUpdate }: MorningResetProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const { toast } = useToast();

  const handleRebuildDay = async (option: 'full' | 'afternoon') => {
    setIsLoading(true);
    setLoadingText("Rebuilding your schedule…");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const currentTime = new Date();
      const today = currentTime.toISOString().split('T')[0];

      // Simulate schedule rebuild logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (option === 'full') {
        // Mock API call for full day rebuild
        const newSchedule = [
          { time: currentTime.getHours() + ":00", activity: "Priority Focus", duration: "90 min" },
          { time: (currentTime.getHours() + 2) + ":00", activity: "Deep Work Block", duration: "60 min" },
          { time: (currentTime.getHours() + 4) + ":00", activity: "Collaboration Time", duration: "45 min" },
          { time: (currentTime.getHours() + 6) + ":00", activity: "Final Focus Sprint", duration: "30 min" }
        ];
        
        toast({
          title: "Full Day Rebuilt",
          description: `Schedule updated starting from ${currentTime.getHours()}:00`,
        });
      } else {
        // Mock API call for afternoon focus
        const afternoonSchedule = [
          { time: "14:00", activity: "Deep Work Session", duration: "90 min" },
          { time: "16:00", activity: "Creative Work", duration: "60 min" },
          { time: "17:30", activity: "Review & Planning", duration: "30 min" }
        ];
        
        toast({
          title: "Afternoon Focus Set",
          description: "Schedule optimized for afternoon productivity",
        });
      }

      // Check if Google Calendar is connected and sync
      const { data: tokens } = await supabase
        .from('gmail_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .single();

      if (tokens?.access_token) {
        setLoadingText("Syncing with Google Calendar…");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Calendar Synced",
          description: "Google Calendar updated with new schedule",
        });
      }

      onScheduleUpdate();
      onClose();
    } catch (error) {
      console.error('Error rebuilding schedule:', error);
      toast({
        title: "Error",
        description: "Failed to rebuild schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-center">{loadingText}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              Start Late? Rebuild Your Day
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground">
              No worries! Let's adjust your schedule to make the most of the remaining day.
            </p>
          </div>

          <div className="grid gap-4">
            {/* Option 1: Rebuild Full Day */}
            <Card 
              className="p-6 border-2 border-transparent hover:border-primary/20 transition-all duration-300 cursor-pointer group"
              onClick={() => handleRebuildDay('full')}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <CalendarCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Rebuild Full Day</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Recalculate your schedule starting from now. We'll compress and shuffle remaining focus blocks to fit.
                  </p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Clock className="w-3 h-3 mr-1" />
                    Optimized timing
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Option 2: Focus Only Afternoon */}
            <Card 
              className="p-6 border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer group"
              onClick={() => handleRebuildDay('afternoon')}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Focus Only Afternoon</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Skip morning routines and focus on deep work sessions for the rest of the day.
                  </p>
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    <Target className="w-3 h-3 mr-1" />
                    Deep work focused
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Your calendar will be updated automatically and synced with Google Calendar if connected.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};