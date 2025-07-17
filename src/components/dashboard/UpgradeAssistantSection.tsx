import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Bot, 
  Zap, 
  MessageSquare,
  Star,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const proFeatures = [
  {
    icon: Bot,
    title: "Custom GPT Dashboard",
    description: "Create your own private AI assistant, trained on your unique workflows and productivity needs. Access it directly from your dashboard or ChatGPT."
  },
  {
    icon: Zap,
    title: "Automation Template Vault",
    description: "Save hours with plug-and-play automation templates for Make.com and Zapier. From AI content creation to daily task management—just copy, paste, and run."
  },
  {
    icon: MessageSquare,
    title: "AI Productivity Coach (WhatsApp or Slack)",
    description: "A real-time productivity companion that checks in with you, adjusts your plan, and provides live support throughout your day. You choose whether to pair it with WhatsApp or Slack."
  }
];

export const UpgradeAssistantSection = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { toast } = useToast();

  // Check if user is already on waitlist
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCheckingStatus(false);
          return;
        }

        const { data, error } = await supabase
          .from('brain_bytes_pro_waitlist')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking waitlist status:', error);
        } else if (data) {
          setIsJoined(true);
        }
      } catch (error) {
        console.error('Error checking waitlist status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkWaitlistStatus();
  }, []);

  const handleWaitlistJoin = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to join the waitlist.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('brain_bytes_pro_waitlist')
        .insert({
          user_id: user.id,
          email: user.email || ''
        });

      if (error) throw error;

      setIsJoined(true);
      toast({
        title: "🎉 You're on the waitlist!",
        description: "We'll notify you when enrollment opens.",
      });
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Brain Bytes Pro</h2>
          <p className="text-sm text-muted-foreground">Unlock the premium version of your AI productivity assistant</p>
        </div>
      </div>

      {/* Main Upgrade Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border border-primary/20">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
              Enrollment Currently Closed
            </Badge>
            <h3 className="text-3xl font-bold text-foreground">
              Brain Bytes Pro
            </h3>
            <p className="text-lg text-muted-foreground">
              Unlock the premium version of your AI productivity assistant
            </p>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">$149</div>
            <p className="text-sm text-muted-foreground">
              One-time fee
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 my-8">
            {proFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-4 text-left">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-lg">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Waitlist Button */}
          {checkingStatus ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !isJoined ? (
            <div className="space-y-4">
              <Button 
                onClick={handleWaitlistJoin}
                disabled={isLoading}
                size="lg"
                className="rounded-xl px-12 py-4 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white transform scale-110"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Star className="w-5 h-5 mr-2" />
                )}
                Join Waitlist
              </Button>
              <p className="text-sm text-muted-foreground">
                Join the waitlist to get early access when enrollment opens
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h4 className="font-semibold text-foreground">🎉 You're on the waitlist!</h4>
              <p className="text-sm text-muted-foreground">
                We'll notify you when enrollment opens
              </p>
              <Button 
                disabled
                size="lg"
                className="rounded-xl px-12 py-4 text-lg bg-green-500/20 text-green-600 cursor-not-allowed transform scale-110"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                ✔️ Waitlist Joined
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Current Plan Info */}
      <Card className="p-4 bg-white/50 backdrop-blur-sm border border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Current Plan: Brain Bytes Basic</h4>
            <p className="text-sm text-muted-foreground">
              You have access to personalized AI plans, focus playlists, and productivity tools
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};