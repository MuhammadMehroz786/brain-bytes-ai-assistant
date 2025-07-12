import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Rocket,
  Menu
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-foreground">Brain Bytes</h1>
            <p className="text-xs text-muted-foreground">Productivity Dashboard</p>
          </div>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={onRestart}
            size="sm"
            className="w-full rounded-xl text-xs sm:text-sm h-8 sm:h-9"
          >
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Create New Plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full rounded-xl text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 sm:h-9"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false); // Close mobile sidebar on selection
              }}
              className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 border border-primary/20 text-primary'
                  : 'hover:bg-muted/50 text-foreground'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-xs sm:text-sm leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-primary/10">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Premium Plan</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Unlock automation and advanced integrations
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-light via-primary-light to-success-light">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 bg-white/90 backdrop-blur-sm border-r border-primary/10 flex-col">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white/90 backdrop-blur-sm border-b border-primary/10 p-4 flex items-center justify-between">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white/90 backdrop-blur-sm">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center">
                <Brain className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Brain Bytes</span>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderSection()}
            </div>
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