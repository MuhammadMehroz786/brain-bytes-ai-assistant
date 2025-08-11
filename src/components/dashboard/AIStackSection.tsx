import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, 
  ArrowRight, 
  Target, 
  Settings, 
  Lightbulb, 
  Lock, 
  Copy, 
  Pencil, 
  Bot, 
  Calendar, 
  MessageSquare,
  Sparkles 
} from "lucide-react";
import type { ProductivityPlan, UserResponses, UserPreferences } from "@/types/productivity";
import { PersonalizationSurvey } from "@/components/PersonalizationSurvey";

interface AIStackSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const AIStackSection = ({ plan, responses }: AIStackSectionProps) => {
  const { toast } = useToast();
  const [showSurvey, setShowSurvey] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Flashcard flow state
  const [currentToolIdx, setCurrentToolIdx] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedUseCases, setSelectedUseCases] = useState<Record<string, string>>({});
  const [selectedSkillByTool, setSelectedSkillByTool] = useState<Record<string, 'beginner' | 'advanced' | 'expert'>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Progress tracking
  const [levelProgress, setLevelProgress] = useState<Record<string, { beginner: boolean; advanced: boolean }>>(() => {
    try { 
      return JSON.parse(localStorage.getItem('toolLevelProgress') || '{}'); 
    } catch { 
      return {}; 
    }
  });

  useEffect(() => {
    localStorage.setItem('toolLevelProgress', JSON.stringify(levelProgress));
  }, [levelProgress]);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  // Tool database
  function getToolDatabase() {
    return [
      {
        name: "ChatGPT Plus",
        description: "Advanced AI assistant for research, writing, and problem-solving",
        category: "AI Assistant",
        categories: ["focus", "writing"],
        complexity: "easy",
        setupComplexity: "simple",
        url: "https://openai.com"
      },
      {
        name: "Notion AI",
        description: "Intelligent writing assistant built into your favorite workspace",
        category: "Writing",
        categories: ["focus", "writing"],
        complexity: "medium",
        setupComplexity: "simple",
        url: "https://notion.so"
      },
      {
        name: "Motion",
        description: "AI-powered calendar that automatically schedules your tasks and blocks focus time",
        category: "Productivity",
        categories: ["focus"],
        complexity: "easy",
        setupComplexity: "simple",
        url: "https://motion.com"
      },
      {
        name: "Bardeen",
        description: "No-code automation platform that connects your favorite apps",
        category: "Automation",
        categories: ["automation"],
        complexity: "medium",
        setupComplexity: "advanced",
        url: "https://bardeen.ai"
      },
      {
        name: "Zapier",
        description: "Connect 5000+ apps to automate repetitive tasks without coding",
        category: "Automation",
        categories: ["automation"],
        complexity: "medium",
        setupComplexity: "advanced",
        url: "https://zapier.com"
      },
      {
        name: "Superhuman",
        description: "The fastest email experience ever made, with AI-powered features",
        category: "Email",
        categories: ["automation", "collaboration"],
        complexity: "easy",
        setupComplexity: "simple",
        url: "https://superhuman.com"
      },
      {
        name: "Jasper",
        description: "AI copywriter that creates high-quality content for marketing and business",
        category: "Writing",
        categories: ["writing"],
        complexity: "easy",
        setupComplexity: "simple",
        url: "https://jasper.ai"
      },
      {
        name: "Grammarly",
        description: "AI writing assistant that helps you write clearly and confidently",
        category: "Writing",
        categories: ["writing"],
        complexity: "easy",
        setupComplexity: "simple",
        url: "https://grammarly.com"
      },
      {
        name: "Linear",
        description: "Issue tracking and project management tool built for software teams",
        category: "Project Management",
        categories: ["collaboration"],
        complexity: "medium",
        setupComplexity: "simple",
        url: "https://linear.app"
      },
      {
        name: "ClickUp",
        description: "All-in-one productivity platform with AI-powered project management",
        category: "Project Management",
        categories: ["collaboration"],
        complexity: "medium",
        setupComplexity: "advanced",
        url: "https://clickup.com"
      }
    ];
  }

  const allTools = useMemo(() => getToolDatabase(), []);
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allTools;
    return allTools.filter(t => 
      [t.name, t.category, ...(t.categories || [])].join(' ').toLowerCase().includes(q)
    );
  }, [allTools, searchQuery]);

  const flashcardTools = filteredTools;

  useEffect(() => {
    setCurrentToolIdx(i => Math.min(i, Math.max(0, flashcardTools.length - 1)));
  }, [flashcardTools.length]);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('ai_tool_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data && !error) {
          const preferences = {
            priority: data.priority,
            experienceLevel: data.experience_level,
            toolPreference: data.tool_preference
          };
          setUserPreferences(preferences);
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const handlePersonalizationComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
  };

  const markLevelComplete = (toolName: string, level: 'beginner' | 'advanced') => {
    setLevelProgress(prev => {
      const curr = prev[toolName] || { beginner: false, advanced: false };
      return { ...prev, [toolName]: { ...curr, [level]: true } };
    });
    toast({ 
      title: 'Progress saved', 
      description: `${level[0].toUpperCase() + level.slice(1)} complete for ${toolName}` 
    });
  };

  const levelsCompleted = (toolName: string) => {
    const st = levelProgress[toolName] || { beginner: false, advanced: false };
    return (st.beginner ? 1 : 0) + (st.advanced ? 1 : 0);
  };

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'Automation': return Zap;
      case 'Writing': return Pencil;
      case 'AI Assistant': return Bot;
      case 'Email': return MessageSquare;
      case 'Project Management': return Calendar;
      case 'Productivity': return Sparkles;
      default: return Sparkles;
    }
  };

  const coreMovesByTool: Record<string, string[]> = {
    "Notion AI": ["Turn a messy idea into an outline", "Draft a page in your voice", "Polish and fact‑check"],
    "ChatGPT Plus": ["Research and summarize faster", "Brainstorm variations", "Improve clarity + tone"],
    "Jasper": ["Generate ad copy", "Rewrite for brevity", "Turn bullets into paragraph"],
    "Grammarly": ["Fix clarity", "Adjust tone", "Proofread for errors"],
    "Motion": ["Auto-schedule tasks", "Block deep work", "Protect focus hours"],
    "Bardeen": ["Automate intake", "Scrape to sheet", "Trigger follow-ups"],
    "Zapier": ["Connect apps", "Create multi-step flows", "Use AI actions"],
    "Superhuman": ["Triage with split inbox", "AI draft replies", "Create snippets"],
    "Linear": ["Plan sprints", "Link PRs", "Triage bugs"],
    "ClickUp": ["Define tasks", "Track progress", "Summarize updates"]
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Prompt copied to clipboard." });
  };

  // Helper function for gradients
  function getToolGradient(category: string) {
    switch (category) {
      case 'Writing': return 'from-blue-500/10 to-purple-500/10';
      case 'Automation': return 'from-green-500/10 to-emerald-500/10';
      case 'AI Assistant': return 'from-orange-500/10 to-red-500/10';
      case 'Email': return 'from-cyan-500/10 to-blue-500/10';
      case 'Project Management': return 'from-violet-500/10 to-purple-500/10';
      default: return 'from-primary/10 to-accent/10';
    }
  }

  // Flashcard Step Components
  function FlashcardStep1() {
    const tool = flashcardTools[currentToolIdx];
    if (!tool) return null;

    const Icon = categoryIcon(tool.category);
    
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center h-full">
        <div className="mb-8">
          <Icon className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">{tool.name}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Used for {tool.description.toLowerCase()}
          </p>
        </div>
        
        <Button
          size="lg"
          onClick={() => setStep(2)}
          className="text-lg px-8 py-4"
        >
          Select Tool
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  function FlashcardStep2() {
    const tool = flashcardTools[currentToolIdx];
    if (!tool) return null;

    const useCases = coreMovesByTool[tool.name] || [
      "Get started with basic features",
      "Improve your workflow",
      "Advanced techniques"
    ];

    return (
      <div className="p-12 h-full">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Choose a Use Case</h2>
          <p className="text-muted-foreground">What would you like to accomplish with {tool.name}?</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {useCases.map((useCase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedUseCases({ [tool.name]: useCase });
                setStep(3);
              }}
              className="w-full p-4 text-left rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="font-medium">{useCase}</div>
            </button>
          ))}
        </div>

        {/* Beginner/Advanced Toggle */}
        <div className="flex justify-center mt-8 mb-6">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setSelectedSkillByTool({ ...selectedSkillByTool, [tool.name]: 'beginner' })}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                (!selectedSkillByTool[tool.name] || selectedSkillByTool[tool.name] === 'beginner') 
                  ? "bg-background shadow-sm" 
                  : "hover:bg-background/50"
              )}
            >
              Beginner
            </button>
            <button
              onClick={() => setSelectedSkillByTool({ ...selectedSkillByTool, [tool.name]: 'advanced' })}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                selectedSkillByTool[tool.name] === 'advanced' 
                  ? "bg-background shadow-sm" 
                  : "hover:bg-background/50"
              )}
            >
              Advanced
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  function FlashcardStep3() {
    const tool = flashcardTools[currentToolIdx];
    if (!tool) return null;

    const skillLevel = selectedSkillByTool[tool.name] || 'beginner';
    const useCase = selectedUseCases[tool.name] || 'Get started';
    const completedLevels = levelsCompleted(tool.name);
    const canAccessExpert = completedLevels >= 2;

    return (
      <div className="p-8 h-full flex flex-col">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Learn {tool.name}</h2>
          <p className="text-muted-foreground">Use case: {useCase}</p>
        </div>

        {/* Skill Level Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setSelectedSkillByTool({ ...selectedSkillByTool, [tool.name]: 'beginner' })}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                skillLevel === 'beginner' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Beginner
            </button>
            <button
              onClick={() => setSelectedSkillByTool({ ...selectedSkillByTool, [tool.name]: 'advanced' })}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                skillLevel === 'advanced' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Advanced
            </button>
            <button
              onClick={() => setSelectedSkillByTool({ ...selectedSkillByTool, [tool.name]: 'expert' })}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                skillLevel === 'expert' ? "bg-background shadow-sm" : "hover:bg-background/50",
                !canAccessExpert && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canAccessExpert}
            >
              Expert {!canAccessExpert && <Lock className="ml-1 h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {skillLevel === 'beginner' && <BeginnerContent tool={tool} useCase={useCase} />}
          {skillLevel === 'advanced' && <AdvancedContent tool={tool} useCase={useCase} />}
          {skillLevel === 'expert' && canAccessExpert && <ExpertContent tool={tool} useCase={useCase} />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button onClick={() => markLevelComplete(tool.name, skillLevel as 'beginner' | 'advanced')}>
            Mark Complete
          </Button>
        </div>
      </div>
    );
  }

  function BeginnerContent({ tool, useCase }: { tool: any; useCase: string }) {
    const prompt = getBeginnerPrompt(tool.name, useCase);
    
    return (
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">Copy-Paste Prompt</h3>
          <div className="bg-muted p-4 rounded-md text-sm font-mono">
            {prompt}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(prompt)}
            className="mt-3"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Prompt
          </Button>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">Watch How to Use It</h3>
          <div className="bg-muted p-8 rounded-md text-center">
            <div className="text-muted-foreground">Video tutorial for {tool.name}</div>
            <div className="text-xs mt-2">
              <Lock className="h-4 w-4 inline mr-1" />
              Unlock with Pro
            </div>
          </div>
        </div>
      </div>
    );
  }

  function AdvancedContent({ tool, useCase }: { tool: any; useCase: string }) {
    const prompt = getAdvancedPrompt(tool.name, useCase);
    
    return (
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">Structured Prompt</h3>
          <div className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
            {prompt}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(prompt)}
            className="mt-3"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Prompt
          </Button>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">Pro Tips</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-primary" />
              Add specific examples to get better tone matching
            </li>
            <li className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-primary" />
              Be explicit about constraints and requirements
            </li>
            <li className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-primary" />
              <span>
                Ask for multiple variations to find the best output
                <Lock className="h-3 w-3 inline ml-1" />
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  function ExpertContent({ tool, useCase }: { tool: any; useCase: string }) {
    return (
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">Advanced Chaining</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Combine {tool.name} with other tools for powerful workflows
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-md text-sm">
              Step 1: Use {tool.name} for initial output
            </div>
            <div className="p-3 bg-muted rounded-md text-sm">
              Step 2: Refine with complementary tool
            </div>
            <div className="p-3 bg-muted rounded-md text-sm">
              Step 3: Automate the process
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-3">Integration Ideas</h3>
          <p className="text-sm text-muted-foreground">
            Advanced automation and workflow integration patterns
          </p>
        </div>
      </div>
    );
  }

  function getBeginnerPrompt(toolName: string, useCase: string): string {
    const prompts: Record<string, string> = {
      "ChatGPT Plus": `Please help me ${useCase.toLowerCase()}. Here's what I'm working on: [describe your situation]. Please provide a clear, step-by-step approach.`,
      "Notion AI": `I want to ${useCase.toLowerCase()} in Notion. Here's my current content: [paste your content]. Please help me organize and improve it.`,
      "Motion": `Help me set up ${useCase.toLowerCase()} in my calendar. My typical work schedule is: [describe schedule]. My priority tasks are: [list tasks].`,
    };
    
    return prompts[toolName] || `Help me ${useCase.toLowerCase()} using ${toolName}. Here's my situation: [describe your needs].`;
  }

  function getAdvancedPrompt(toolName: string, useCase: string): string {
    const prompts: Record<string, string> = {
      "ChatGPT Plus": `Context: [Your specific situation]
Goal: ${useCase}
Constraints: [Any limitations or requirements]
Format: [Desired output format]
Tone: [Professional/casual/etc.]

Please provide a solution that:
1. Addresses the specific context
2. Meets all constraints
3. Follows the requested format
4. Uses the appropriate tone

Checklist:
□ Context clearly understood
□ All constraints considered
□ Format requirements met
□ Tone is appropriate`,
    };
    
    return prompts[toolName] || `Advanced prompt for ${toolName} - ${useCase}`;
  }

  return (
    <div className="fixed inset-0 bg-background flex h-screen w-full">
      {/* Left Navigation Panel */}
      <div className="w-80 border-r bg-card/50 backdrop-blur-sm flex flex-col">
        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <Input
              placeholder="I need help with..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">
              <Target className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tool List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {flashcardTools.map((tool, idx) => {
            const Icon = categoryIcon(tool.category);
            const isActive = idx === currentToolIdx;
            const completedLevels = levelsCompleted(tool.name);
            
            return (
              <button
                key={tool.name}
                onClick={() => setCurrentToolIdx(idx)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all hover:bg-accent/50",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tool.category}
                    </div>
                  </div>
                  {completedLevels > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {completedLevels}/3
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Edit My Answers Button */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            onClick={() => setShowSurvey(true)}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit My Answers
          </Button>
        </div>
      </div>

      {/* Main Flashcard Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        {flashcardTools.length > 0 && (
          <Card className={cn(
            "w-full max-w-4xl h-[600px] relative overflow-hidden transition-all duration-500 animate-fade-in",
            `bg-gradient-to-br ${getToolGradient(flashcardTools[currentToolIdx]?.category)}`
          )}>
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
            <div className="relative h-full flex flex-col">
              {step === 1 && <FlashcardStep1 />}
              {step === 2 && <FlashcardStep2 />}
              {step === 3 && <FlashcardStep3 />}
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      {showSurvey && (
        <PersonalizationSurvey
          isOpen={showSurvey}
          onClose={() => setShowSurvey(false)}
          onComplete={handlePersonalizationComplete}
        />
      )}
    </div>
  );
};