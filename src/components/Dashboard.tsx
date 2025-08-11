import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Clock,
  Brain,
  Mail,
  Music,
  Settings,
  Rocket,
  Menu,
  Target,
  LogOut,
  Play
} from "lucide-react";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";
import type { UserPrefs } from "./education/types";
import { supabase } from "@/integrations/supabase/client";
import { DailyAINavigatorSection } from "./dashboard/DailyAINavigatorSection";
import { EmailSummarySection } from "./dashboard/EmailSummarySection";
import { GoogleCalendarSection } from "./dashboard/GoogleCalendarSection";
import { FocusPlaylistSection } from "./dashboard/FocusPlaylistSection";
import { SystemSettingsSection } from "./dashboard/SystemSettingsSection";
import { UpgradeAssistantSection } from "./dashboard/UpgradeAssistantSection";
import { DailyFocusPopup } from "./dashboard/DailyFocusPopup";
import ToolPicker from "./education/ToolPicker";
import LearningCard from "./education/LearningCard";
import CoachRail from "./education/CoachRail";
import { EDUCATION_DATA } from "./education/data";
import { useEducationProgress } from "@/hooks/useEducationProgress";
import { useAnalytics } from "@/hooks/useAnalytics";

type SectionId = 'daily-navigator' | 'email-recap' | 'ai-plan' | 'smart-stack' | 'focus-playlist' | 'system-settings' | 'upgrade-assistant';

interface DashboardProps {
  plan: ProductivityPlan;
  responses: UserResponses;
  onRestart: () => void;
}

export const Dashboard = ({ plan, responses, onRestart }: DashboardProps) => {
  const { toast } = useToast();
  const analytics = useAnalytics();
  
  // AI Education Hub state
  const [prefs, setPrefs] = useState<UserPrefs>(() => {
    const raw = localStorage.getItem("aihub:prefs");
    return raw ? JSON.parse(raw) : { skill: "beginner" };
  });
  
  const { getToolProgress, markCardComplete } = useEducationProgress();
  
  const tools = EDUCATION_DATA.tools;
  const starterPath = EDUCATION_DATA.getStarterPath(prefs);
  
  const [activeToolId, setActiveToolId] = useState<string>(starterPath.cards[0]?.toolId || tools[0].id);
  const [activeCardId, setActiveCardId] = useState<string>(starterPath.cards[0]?.cardId || tools[0].cards[0].id);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('smart-stack'); // Default to AI Education Hub
  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [todaysPriority, setTodaysPriority] = useState<string>("");

  const activeTool = tools.find(t => t.id === activeToolId) || tools[0];
  const activeCard = activeTool.cards.find(c => c.id === activeCardId) || activeTool.cards[0];

  const handleSelectTool = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;
    setActiveToolId(toolId);
    const completed = getToolProgress(toolId).completedCards || [];
    const next = tool.cards.find(c => !completed.includes(c.id));
    setActiveCardId(next?.id || tool.cards[0].id);
    analytics.track('card_opened', { toolId: toolId, cardId: next?.id || tool.cards[0].id });
  };

  const handleMarkMastery = () => {
    markCardComplete(activeToolId, activeCardId);
    toast({ title: "Nice! +1 step toward your goal.", description: "Saved to My Templates." });
    analytics.track('mark_mastery', { toolId: activeToolId, cardId: activeCardId });
    // Suggest next card in same tool or starter path
    const tool = tools.find(t => t.id === activeToolId)!;
    const remaining = tool.cards.find(c => !getToolProgress(activeToolId).completedCards?.includes(c.id));
    if (remaining) setActiveCardId(remaining.id);
  };

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

  const menuItems = [
    {
      id: 'daily-navigator' as SectionId,
      title: 'Daily AI Navigator',
      icon: Brain,
      description: 'Smart task recommendations',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'email-recap' as SectionId,
      title: 'Email Summary',
      icon: Mail,
      description: 'Important emails only',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'ai-plan' as SectionId,
      title: 'Your Smart Calendar',
      icon: Clock,
      description: 'Personalized schedule',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'smart-stack' as SectionId,
      title: 'AI Education Hub',
      icon: Sparkles,
      description: 'Learn AI by doing — tiny wins, step by step.',
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-100'
    },
    {
      id: 'focus-playlist' as SectionId,
      title: 'Focus Playlist',
      icon: Music,
      description: 'Mood-based music',
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-100'
    },
    {
      id: 'system-settings' as SectionId,
      title: 'System Settings',
      icon: Settings,
      description: 'Preferences & sync',
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'upgrade-assistant' as SectionId,
      title: 'Upgrade Assistant',
      icon: Rocket,
      description: 'Unlock more features',
      iconColor: 'text-indigo-600',
      bgColor: 'bg-gradient-to-r from-indigo-100 to-purple-100',
      isSpecial: true
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'daily-navigator':
        return <DailyAINavigatorSection plan={plan} responses={responses} todaysPriority={todaysPriority} />;
      case 'email-recap':
        return <EmailSummarySection />;
      case 'ai-plan':
        return <GoogleCalendarSection />;
      case 'smart-stack':
        return (
          <div className="space-y-4">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">AI Education Hub</h1>
              <p className="text-sm text-muted-foreground">Learn AI by doing — tiny wins, step by step.</p>
            </div>

            {/* Mobile Tool Picker & Tips */}
            <div className="md:hidden flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Tools
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-96 p-0">
                  <ToolPicker
                    prefs={prefs}
                    setPrefs={(p) => { setPrefs(p); localStorage.setItem('aihub:prefs', JSON.stringify(p)); }}
                    tools={tools}
                    starterPath={starterPath}
                    onSelect={handleSelectTool}
                    getProgress={getToolProgress}
                  />
                </SheetContent>
              </Sheet>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">Tips</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] sm:w-80 p-0">
                  <CoachRail 
                    tool={activeTool} 
                    card={activeCard} 
                    onAsk={() => analytics.track('ask_assistant', { toolId: activeToolId, cardId: activeCardId })} 
                    beginner={prefs.skill !== 'advanced'} 
                  />
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_280px] gap-6">
              {/* Left: Tool Picker */}
              <div className="hidden lg:block">
                <Card className="sticky top-4 h-fit">
                  <CardContent className="p-0">
                    <ToolPicker
                      prefs={prefs}
                      setPrefs={(p) => { setPrefs(p); localStorage.setItem('aihub:prefs', JSON.stringify(p)); }}
                      tools={tools}
                      starterPath={starterPath}
                      onSelect={handleSelectTool}
                      getProgress={getToolProgress}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Center: Learning Card */}
              <div className="flex-1">
                <LearningCard
                  prefs={prefs}
                  setPrefs={(p) => { setPrefs(p); localStorage.setItem('aihub:prefs', JSON.stringify(p)); }}
                  tool={activeTool}
                  card={activeCard}
                  onCopy={() => analytics.track('prompt_copied', { toolId: activeToolId, cardId: activeCardId })}
                  onOpenTool={() => analytics.track('open_in_tool_clicked', { toolId: activeToolId, cardId: activeCardId })}
                  onMarkMastery={handleMarkMastery}
                  onNext={() => handleSelectTool(activeToolId)}
                />
              </div>

              {/* Right: Coach Rail */}
              <div className="hidden lg:block">
                <Card className="sticky top-4 h-fit">
                  <CardContent className="p-0">
                    <CoachRail 
                      tool={activeTool} 
                      card={activeCard} 
                      onAsk={() => analytics.track('ask_assistant', { toolId: activeToolId, cardId: activeCardId })} 
                      beginner={prefs.skill !== 'advanced'} 
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
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
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img 
              src="/lovable-uploads/704fc48f-fec6-4000-9776-f878e0249feb.png" 
              alt="Brain Bytes Logo" 
              className="w-full h-full object-contain"
            />
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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false); // Close mobile sidebar on selection
              }}
              className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/10 border border-primary/20 text-primary'
                  : item.isSpecial
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-lg scale-105 hover:shadow-xl hover:scale-110 text-foreground'
                    : 'hover:bg-muted/50 text-foreground'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : item.isSpecial
                      ? `${item.bgColor} scale-110 shadow-md hover:scale-125 hover:shadow-lg`
                      : `${item.bgColor} group-hover:scale-105`
                }`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-300 ${
                    isActive ? 'text-white' : item.isSpecial ? `${item.iconColor}` : item.iconColor
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-xs sm:text-sm leading-tight transition-all duration-300 ${
                    isActive ? 'text-primary' : item.isSpecial ? 'text-indigo-700 hover:text-indigo-800' : 'text-foreground'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs mt-1 hidden sm:block transition-all duration-300 ${
                    item.isSpecial ? 'text-indigo-600 hover:text-indigo-700' : 'text-muted-foreground'
                  }`}>
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
              <div className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/704fc48f-fec6-4000-9776-f878e0249feb.png" 
                  alt="Brain Bytes Logo" 
                  className="w-full h-full object-contain"
                />
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