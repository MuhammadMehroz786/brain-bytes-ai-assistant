import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Zap, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SystemUpgradeWaitlist = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const { toast } = useToast();

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced input validation
    if (!email || !email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (email.length > 320) {
      toast({
        title: "Email too long",
        description: "Email address must be less than 320 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('prelaunch_roi_waitlist')
        .insert([{ email: email.trim().toLowerCase() }]);

      if (error) throw error;

      setIsJoined(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you when System Upgrade becomes available.",
      });
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (isJoined) {
    return (
      <Card className="p-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">You're on the waitlist!</h3>
          <p className="text-muted-foreground">
            We'll email you the moment System Upgrade launches with exclusive early access.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-to-r from-gray-50 to-slate-50 border-slate-200">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Want to automate your entire AI workflow?
        </h3>
        <p className="text-muted-foreground mb-6">
          Auto-sync tasks, connect apps, and unlock smart automation. Enrollment currently closed—join the waitlist.
        </p>

        <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-xl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Join the Waitlist
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </Card>
  );
};