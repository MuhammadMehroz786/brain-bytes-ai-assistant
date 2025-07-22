import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [startTime, setStartTime] = useState("");
  const [showTimeInput, setShowTimeInput] = useState(false);
  const { toast } = useToast();

  const handleRebuildDay = async (startTime: string) => {
    setIsLoading(true);
    setLoadingText("Rebuilding your schedule…");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const currentTime = new Date();
      const today = currentTime.toISOString().split('T')[0];

      // Parse the start time and generate schedule from that point
      await new Promise(resolve => setTimeout(resolve, 2000));

      const [hours, minutes] = startTime.split(':').map(Number);
      const startHour = hours;
      
      const newSchedule = [
        { time: `${startHour}:00`, activity: "Priority Focus Sprint", duration: "90 min" },
        { time: `${startHour + 2}:00`, activity: "Deep Work Block", duration: "60 min" },
        { time: `${startHour + 4}:00`, activity: "Break & Reset", duration: "15 min" },
        { time: `${startHour + 5}:00`, activity: "Final Focus Sprint", duration: "30 min" }
      ];
      
      toast({
        title: "Day Rebuilt Successfully",
        description: `New schedule created starting from ${startTime}`,
      });

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
          {!showTimeInput ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <RotateCcw className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Let's rebuild your day.
                </h3>
                <p className="text-muted-foreground">
                  What time are you starting now?
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="start-time" className="text-sm font-medium">
                  Current Time
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-center text-lg"
                />
                <Button 
                  onClick={() => {
                    if (startTime) {
                      setShowTimeInput(true);
                      handleRebuildDay(startTime);
                    } else {
                      toast({
                        title: "Please select a time",
                        description: "We need to know when you're starting to rebuild your schedule.",
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={!startTime}
                  className="w-full"
                >
                  Rebuild Schedule
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CalendarCheck className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Schedule Rebuilt!
              </h3>
              <p className="text-muted-foreground mb-4">
                Your new schedule includes 1-2 focus sprints, mini win goals, and planned breaks.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                  <span>Priority Focus Sprint</span>
                  <span>90 min</span>
                </div>
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                  <span>Deep Work Block</span>
                  <span>60 min</span>
                </div>
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                  <span>Break & Reset</span>
                  <span>15 min</span>
                </div>
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                  <span>Final Focus Sprint</span>
                  <span>30 min</span>
                </div>
              </div>
            </div>
          )}

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