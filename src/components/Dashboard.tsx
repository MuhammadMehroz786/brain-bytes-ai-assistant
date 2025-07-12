import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Sparkles, 
  MessageSquare, 
  ArrowUp, 
  Users, 
  Clock,
  Zap,
  Brain,
  Target,
  Star,
  LogOut,
  Music,
  Settings,
  Rocket
} from "lucide-react";
import { DailyAINavigatorSection } from "./dashboard/DailyAINavigatorSection";
import { DailyFlowSection } from "./dashboard/DailyFlowSection";
import { AIStackSection } from "./dashboard/AIStackSection";
import { FocusPlaylistSection } from "./dashboard/FocusPlaylistSection";
import { UpgradeAssistantSection } from "./dashboard/UpgradeAssistantSection";
import { SystemSettingsSection } from "./dashboard/SystemSettingsSection";
import { EmailSummarySection } from "./dashboard/EmailSummarySection";
import { DailyFocusPopup } from "./dashboard/DailyFocusPopup";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DashboardProps {
  plan: ProductivityPlan;
  responses: UserResponses;
  onRestart: () => void;
}

type SectionId = 'daily-navigator' | 'email-recap' | 'ai-plan' | 'smart-stack' | 'focus-playlist' | 'system-settings' | 'upgrade-assistant';

export const Dashboard = ({ plan, responses, onRestart }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState<SectionId>('daily-navigator');
  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [todaysPriority, setTodaysPriority] = useState<string>("");
  const { toast } = useToast();

  // Check if popup should be shown (once per day)
  useEffect(() => {
    const lastShown = localStorage.getItem('lastDailyPopup');
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setShowDailyPopup(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDailyPopupClose = () => {
    setShowDailyPopup(false);
    const today = new Date().toDateString();
    localStorage.setItem('lastDailyPopup', today);
  };

  const handlePrioritySave = (priority: string) => {
    setTodaysPriority(priority);
    localStorage.setItem('todaysPriority', priority);
    toast({
      title: "Focus set!",
      description: `Your priority today: ${priority}`,
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You've been logged out of your account",
      });
      onRestart(); // This will redirect to intro screen
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = [
    {
      id: 'daily-navigator' as SectionId,
      title: 'Daily AI Navigator',
      icon: Brain,
      description: 'Your AI coach'
    },
    {
      id: 'email-recap' as SectionId,
      title: 'Today\'s Email Recap',
      icon: MessageSquare,
      description: 'AI-summarized emails'
    },
    {
      id: 'ai-plan' as SectionId,
      title: 'Your Smart Calendar',
      icon: Clock,
      description: 'Personalized schedule'
    },
    {
      id: 'smart-stack' as SectionId,
      title: 'Smart Stack',
      icon: Zap,
      description: 'AI tools & tutorials'
    },
    {
      id: 'focus-playlist' as SectionId,
      title: 'Focus Playlist',
      icon: Music,
      description: 'Mood-based music'
    },
    {
      id: 'system-settings' as SectionId,
      title: 'System Settings',
      icon: Settings,
      description: 'Preferences & sync'
    },
    {
      id: 'upgrade-assistant' as SectionId,
      title: 'Upgrade Assistant🚀',
      icon: Rocket,
      description: 'Unlock more features'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'daily-navigator':
        return <DailyAINavigatorSection plan={plan} responses={responses} todaysPriority={todaysPriority} />;
      case 'email-recap':
        return <EmailSummarySection />;
      case 'ai-plan':
        return <DailyFlowSection plan={plan} responses={responses} />;
      case 'smart-stack':
        return <AIStackSection plan={plan} responses={responses} />;
      case 'focus-playlist':
        return <FocusPlaylistSection />;
      case 'system-settings':
        return <SystemSettingsSection />;
      case 'upgrade-assistant':
        return <UpgradeAssistantSection />;
      default:
        return <DailyAINavigatorSection plan={plan} responses={responses} todaysPriority={todaysPriority} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-light via-primary-light to-success-light">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-primary/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Brain Bytes</h1>
                <p className="text-sm text-muted-foreground">Productivity Dashboard</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={onRestart}
                size="sm"
                className="w-full rounded-xl"
              >
                <Target className="w-4 h-4 mr-2" />
                Create New Plan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full rounded-xl text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 border border-primary/20 text-primary'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary/10">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Premium Plan</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Unlock automation and advanced integrations
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Daily Focus Popup */}
      {showDailyPopup && (
        <DailyFocusPopup 
          onClose={handleDailyPopupClose}
          onSave={handlePrioritySave}
        />
      )}
    </div>
  );
};