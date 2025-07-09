import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Calendar, Zap, Bot, CheckCircle, Sparkles, Clock } from "lucide-react";

export const SystemUpgradeSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Auto-sync to Google Calendar",
      description: "Your daily schedule automatically appears in your calendar with smart reminders",
      badge: "Popular"
    },
    {
      icon: Zap,
      title: "Notion + Todoist Integration",
      description: "Seamlessly sync tasks, notes, and goals across your favorite productivity apps",
      badge: "New"
    },
    {
      icon: Bot,
      title: "Daily AI Check-ins",
      description: "Personalized morning briefings and evening reviews to optimize your workflow",
      badge: "Premium"
    },
    {
      icon: Clock,
      title: "Smart Time Tracking",
      description: "Automatic time tracking with AI-powered insights on your productivity patterns",
      badge: "Beta"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 mb-4">
          <ArrowUp className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Want Your Plan Automated?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your productivity plan from a static guide into a living, breathing system that adapts and evolves with you
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full transform translate-x-16 -translate-y-16" />
              
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge 
                      variant={feature.badge === 'Popular' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Available in System Builder</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pricing card */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full transform translate-x-20 -translate-y-20" />
        
        <div className="relative text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">System Builder Premium</h3>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">$149</div>
            <p className="text-sm text-muted-foreground">
              Enrollment currently closed
            </p>
            <p className="text-warning text-sm font-medium">
              Join Waitlist – Invite Only
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              size="lg" 
              variant="outline"
              className="w-full rounded-xl"
            >
              <ArrowUp className="w-5 h-5 mr-2" />
              Join Waitlist
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Get notified when enrollment reopens
            </p>
          </div>

        </div>
      </Card>
    </div>
  );
};