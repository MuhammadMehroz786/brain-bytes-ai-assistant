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
    description: "Create your own private AI assistant, trained on your unique workflows and productivity needs. Access it directly from your dashboard or ChatGPT.",
    gradient: "from-blue-500 to-purple-600",
    bgGradient: "from-blue-500/5 to-purple-600/10"
  },
  {
    icon: Zap,
    title: "Automation Template Vault",
    description: "Save hours with plug-and-play automation templates for Make.com and Zapier. From AI content creation to daily task management—just copy, paste, and run.",
    gradient: "from-yellow-500 to-orange-600",
    bgGradient: "from-yellow-500/5 to-orange-600/10"
  },
  {
    icon: MessageSquare,
    title: "AI Productivity Coach (WhatsApp or Slack)",
    description: "A real-time productivity companion that checks in with you, adjusts your plan, and provides live support throughout your day. You choose whether to pair it with WhatsApp or Slack.",
    gradient: "from-green-500 to-teal-600",
    bgGradient: "from-green-500/5 to-teal-600/10"
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
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Brain Bytes Pro</h2>
          <p className="text-sm text-muted-foreground">Unlock the premium version of your AI productivity assistant</p>
        </div>
      </div>

      {/* Main Upgrade Card */}
      <Card className="p-4 bg-gradient-to-br from-primary/8 via-accent/8 to-success/8 border border-primary/30 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-teal-500/5 to-blue-500/5" />
        
        <div className="relative text-center space-y-4">
          <div className="space-y-2">
            {/* Enrollment Status Badge - Static with Hover */}
            <div className="inline-flex items-center justify-center">
              <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/40 px-3 py-1 text-xs font-medium hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                Enrollment Currently Closed — Join Waitlist
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold text-foreground">
              Brain Bytes Pro
            </h3>
          </div>

          {/* Enhanced Pricing Display */}
          <div className="space-y-2">
            <div className="inline-block p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <div className="text-3xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                $149
              </div>
              <div className="text-sm font-semibold text-foreground">
                — One-Time Payment
              </div>
              <p className="text-xs text-muted-foreground">
                No subscriptions. Lifetime access.
              </p>
            </div>
          </div>

          {/* Features Grid - Individual Cards */}
          <div className="grid gap-3 my-4">
            {proFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`group relative p-3 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border border-primary/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] hover:border-primary/30`}
                >
                  {/* Background glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative flex items-start gap-3 text-left">
                    <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed text-xs">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Corner accent with feature-specific color */}
                  <div className={`absolute top-2 right-2 w-1.5 h-1.5 bg-gradient-to-br ${feature.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                </Card>
              );
            })}
          </div>

          {/* Waitlist Button */}
          {checkingStatus ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !isJoined ? (
            <div className="space-y-2">
              <Button 
                onClick={handleWaitlistJoin}
                disabled={isLoading}
                size="default"
                className="rounded-lg px-8 py-2 text-sm bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Join Waitlist
              </Button>
              <p className="text-xs text-muted-foreground">
                Get early access when enrollment opens
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2 animate-fade-in">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-sm">✅ You're on the waitlist!</h4>
                <p className="text-muted-foreground text-xs">
                  We'll notify you when enrollment opens
                </p>
              </div>
              
              <Button 
                disabled
                size="sm"
                className="rounded-lg px-6 py-2 text-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 cursor-not-allowed border border-green-300/30"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                On Waitlist
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};