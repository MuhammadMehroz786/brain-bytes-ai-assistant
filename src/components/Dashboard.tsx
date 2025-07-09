import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Star
} from "lucide-react";
import { DailyFlowSection } from "./dashboard/DailyFlowSection";
import { AIStackSection } from "./dashboard/AIStackSection";
import { GPTPromptsSection } from "./dashboard/GPTPromptsSection";
import { SystemUpgradeSection } from "./dashboard/SystemUpgradeSection";
import { CommunityPicksSection } from "./dashboard/CommunityPicksSection";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface DashboardProps {
  plan: ProductivityPlan;
  responses: UserResponses;
  onRestart: () => void;
}

type SectionId = 'daily-flow' | 'ai-stack' | 'gpt-prompts' | 'system-upgrade' | 'community-picks';

export const Dashboard = ({ plan, responses, onRestart }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState<SectionId>('daily-flow');

  const sidebarItems = [
    {
      id: 'daily-flow' as SectionId,
      title: 'Your Optimized Daily Flow',
      icon: Clock,
      description: 'Timeline schedule'
    },
    {
      id: 'ai-stack' as SectionId,
      title: 'Your AI Productivity Stack',
      icon: Zap,
      description: 'Recommended tools'
    },
    {
      id: 'gpt-prompts' as SectionId,
      title: 'Smart GPT Prompts',
      icon: MessageSquare,
      description: 'Custom prompts'
    },
    {
      id: 'system-upgrade' as SectionId,
      title: 'System Upgrade',
      icon: ArrowUp,
      description: 'Automation features'
    },
    {
      id: 'community-picks' as SectionId,
      title: 'Community Picks',
      icon: Users,
      description: 'What others use'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'daily-flow':
        return <DailyFlowSection plan={plan} responses={responses} />;
      case 'ai-stack':
        return <AIStackSection plan={plan} responses={responses} />;
      case 'gpt-prompts':
        return <GPTPromptsSection plan={plan} responses={responses} />;
      case 'system-upgrade':
        return <SystemUpgradeSection />;
      case 'community-picks':
        return <CommunityPicksSection />;
      default:
        return <DailyFlowSection plan={plan} responses={responses} />;
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
            <Button
              variant="outline"
              onClick={onRestart}
              size="sm"
              className="w-full rounded-xl"
            >
              <Target className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
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
    </div>
  );
};