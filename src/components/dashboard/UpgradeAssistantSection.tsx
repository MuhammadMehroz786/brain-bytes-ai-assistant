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
      <Card className="p-8 bg-gradient-to-br from-primary/8 via-accent/8 to-success/8 border border-primary/30 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-teal-500/5 to-blue-500/5" />
        
        <div className="relative text-center space-y-8">
          <div className="space-y-4">
            {/* Enrollment Status Badge with Animation */}
            <div className="inline-flex items-center justify-center">
              <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/40 px-4 py-2 text-sm font-medium animate-pulse">
                <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                Enrollment Currently Closed — Join Waitlist
              </Badge>
            </div>
            
            <h3 className="text-3xl font-bold text-foreground">
              Brain Bytes Pro
            </h3>
            <p className="text-lg text-muted-foreground">
              Unlock the premium version of your AI productivity assistant
            </p>
          </div>

          {/* Enhanced Pricing Display */}
          <div className="space-y-3">
            <div className="inline-block p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
              <div className="text-6xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                $149
              </div>
              <div className="text-lg font-semibold text-foreground mt-2">
                One-Time Payment
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                No subscriptions. Lifetime access.
              </p>
            </div>
          </div>

          {/* Features Grid - Individual Cards */}
          <div className="grid gap-6 my-8">
            {proFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`group relative p-6 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border border-primary/20 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/30`}
                  style={{
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  {/* Background glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative flex items-start gap-5 text-left">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h4 className="font-bold text-foreground text-xl leading-tight group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Corner accent with feature-specific color */}
                  <div className={`absolute top-4 right-4 w-2 h-2 bg-gradient-to-br ${feature.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
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
            <div className="text-center space-y-4 animate-fade-in">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                {/* Success animation sparkles */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1 left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-xl">✅ You're on the waitlist!</h4>
                <p className="text-muted-foreground">
                  We'll notify you when enrollment opens
                </p>
              </div>
              
              <Button 
                disabled
                size="lg"
                className="rounded-xl px-12 py-4 text-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 cursor-not-allowed transform scale-110 border border-green-300/30"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                ✅ You're on the waitlist!
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