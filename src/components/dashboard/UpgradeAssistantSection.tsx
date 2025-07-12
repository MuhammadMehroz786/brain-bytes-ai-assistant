import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Sparkles, 
  Zap, 
  Calendar, 
  Mail, 
  Bell,
  Star,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const upgradeFeatures = [
  {
    icon: Calendar,
    title: "Smart Calendar Integration",
    description: "AI automatically schedules your tasks around meetings"
  },
  {
    icon: Mail,
    title: "Daily Email Reports",
    description: "Get personalized productivity insights every morning"
  },
  {
    icon: Bell,
    title: "Smart Notifications", 
    description: "Gentle reminders based on your energy patterns"
  },
  {
    icon: Zap,
    title: "Advanced AI Automations",
    description: "Auto-generate meeting notes, task lists, and more"
  },
  {
    icon: Sparkles,
    title: "Personalized AI Coach",
    description: "24/7 productivity mentor tailored to your work style"
  }
];

export const UpgradeAssistantSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setEmail("");
      toast({
        title: "You're on the waitlist!",
        description: "We'll notify you when these premium features are available.",
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Upgrade Assistant</h2>
          <p className="text-sm text-muted-foreground">Unlock advanced AI features</p>
        </div>
      </div>

      {/* Main Upgrade Card */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border border-primary/20">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
              Coming Soon
            </Badge>
            <h3 className="text-2xl font-bold text-foreground">
              Brain Bytes Pro
            </h3>
            <p className="text-lg text-muted-foreground">
              The ultimate AI productivity assistant
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4 my-8">
            {upgradeFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 text-left">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Waitlist Form */}
          {!isSubmitted ? (
            <form onSubmit={handleWaitlistSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="rounded-xl border-2 border-border focus:border-primary"
                  required
                />
                <Button 
                  type="submit"
                  className="rounded-xl px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Be the first to access these premium features
              </p>
            </form>
          ) : (
            <div className="text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h4 className="font-semibold text-foreground">You're on the list!</h4>
              <p className="text-sm text-muted-foreground">
                We'll email you as soon as Brain Bytes Pro is ready
              </p>
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