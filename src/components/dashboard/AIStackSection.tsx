import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import MasteryRing from "./MasteryRing";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, ExternalLink, Star, Settings, Lightbulb, Lock, Copy, Check, ListChecks, ClipboardCheck, Sparkles, ArrowRight, Target, Pencil, Palette, Bot, Calendar, MessageSquare } from "lucide-react";
import type { ProductivityPlan, UserResponses, UserPreferences } from "@/types/productivity";
import { PersonalizationSurvey } from "@/components/PersonalizationSurvey";
import { SystemUpgradeWaitlist } from "@/components/SystemUpgradeWaitlist";
import { supabase } from "@/integrations/supabase/client";
interface AIStackSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}
export const AIStackSection = ({
  plan,
  responses
}: AIStackSectionProps) => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [personalizedTools, setPersonalizedTools] = useState(plan.aiTools);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Local UI state
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [checklists, setChecklists] = useState<Record<string, boolean[]>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeMove, setActiveMove] = useState<string | null>(null);
  const [moveInput, setMoveInput] = useState("");
  const [moveSubmitted, setMoveSubmitted] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [expandedMoves, setExpandedMoves] = useState<Record<string, string | null>>({});
  const [userName, setUserName] = useState<string>("Alex Chen");
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg");

  // Flashcard flow state
  const [currentToolIdx, setCurrentToolIdx] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedUseCases, setSelectedUseCases] = useState<Record<string, string>>({});
  const [selectedSkillByTool, setSelectedSkillByTool] = useState<Record<string, 'beginner' | 'advanced'>>({});
  const [upsellDismissed, setUpsellDismissed] = useState(false);

const [searchQuery, setSearchQuery] = useState('');
const allTools = useMemo(() => getToolDatabase(), []);
const filteredTools = useMemo(() => {
  const q = searchQuery.toLowerCase().trim();
  if (!q) return allTools;
  return allTools.filter(t => [t.name, t.category, ...(t.categories || [])].join(' ').toLowerCase().includes(q));
}, [allTools, searchQuery]);
const flashcardTools = filteredTools;
useEffect(() => {
  setCurrentToolIdx(i => Math.min(i, Math.max(0, flashcardTools.length - 1)));
}, [flashcardTools.length]);

const [levelProgress, setLevelProgress] = useState<Record<string, { beginner: boolean; advanced: boolean }>>(() => {
  try { return JSON.parse(localStorage.getItem('toolLevelProgress') || '{}'); } catch { return {}; }
});
useEffect(() => {
  localStorage.setItem('toolLevelProgress', JSON.stringify(levelProgress));
}, [levelProgress]);

const markLevelComplete = (toolName: string, level: 'beginner' | 'advanced') => {
  setLevelProgress(prev => {
    const curr = prev[toolName] || { beginner: false, advanced: false };
    return { ...prev, [toolName]: { ...curr, [level]: true } };
  });
  toast({ title: 'Progress saved', description: `${level[0].toUpperCase() + level.slice(1)} complete for ${toolName}` });
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

const [mobileNavOpen, setMobileNavOpen] = useState(false);

const [refinePicks, setRefinePicks] = useState<Record<string, string[]>>({});

const toolRefs = useRef<Record<string, HTMLDivElement | null>>({});
const { toast } = useToast();

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
  }, []);
  const loadUserPreferences = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        // Best-effort profile details (front-end only)
        const display = (user.user_metadata as any)?.full_name || user.email || "Alex Chen";
        const avatar = (user.user_metadata as any)?.avatar_url || "/placeholder.svg";
        setUserName(display);
        setAvatarUrl(avatar);
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
          generatePersonalizedTools(preferences);
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };
  const generatePersonalizedTools = (preferences: UserPreferences) => {
    const toolDatabase = getToolDatabase();
    let recommendedTools = [];

    // Filter tools based on priority
    const priorityTools = toolDatabase.filter(tool => tool.categories.includes(preferences.priority));

    // Filter based on experience level
    const experienceFilteredTools = priorityTools.filter(tool => {
      if (preferences.experienceLevel === 'beginner') {
        return tool.complexity === 'easy';
      } else if (preferences.experienceLevel === 'intermediate') {
        return ['easy', 'medium'].includes(tool.complexity);
      } else {
        return true; // advanced users can use any tool
      }
    });

    // Filter based on tool preference
    const finalTools = experienceFilteredTools.filter(tool => {
      if (preferences.toolPreference === 'simple') {
        return tool.setupComplexity === 'simple';
      } else {
        return true; // advanced preference can use any setup complexity
      }
    });

    // Take top 6 tools and fallback to default if not enough
    recommendedTools = finalTools.slice(0, 6);
    if (recommendedTools.length < 3) {
      // Fallback to some default tools if filtering results in too few tools
      const fallbackTools = toolDatabase.slice(0, 6 - recommendedTools.length);
      recommendedTools = [...recommendedTools, ...fallbackTools];
    }
    setPersonalizedTools(recommendedTools);
  };
  const handlePersonalizationComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    generatePersonalizedTools(preferences);
  };
function getToolDatabase() {
  return [
  // Focus & Deep Work tools
  {
    name: "Motion",
    description: "AI-powered calendar that automatically schedules your tasks and blocks focus time.",
    category: "Productivity",
    categories: ["focus"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://motion.com"
  }, {
    name: "Notion AI",
    description: "Intelligent writing assistant built into your favorite workspace.",
    category: "Writing",
    categories: ["focus", "writing"],
    complexity: "medium",
    setupComplexity: "simple",
    url: "https://notion.so"
  }, {
    name: "ChatGPT Plus",
    description: "Advanced AI assistant for research, writing, and problem-solving.",
    category: "AI Assistant",
    categories: ["focus", "writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://openai.com"
  },
  // Automation tools
  {
    name: "Bardeen",
    description: "No-code automation platform that connects your favorite apps.",
    category: "Automation",
    categories: ["automation"],
    complexity: "medium",
    setupComplexity: "advanced",
    url: "https://bardeen.ai"
  }, {
    name: "Zapier",
    description: "Connect 5000+ apps to automate repetitive tasks without coding.",
    category: "Automation",
    categories: ["automation"],
    complexity: "medium",
    setupComplexity: "advanced",
    url: "https://zapier.com"
  }, {
    name: "Superhuman",
    description: "The fastest email experience ever made, with AI-powered features.",
    category: "Email",
    categories: ["automation", "collaboration"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://superhuman.com"
  },
  // Writing tools
  {
    name: "Jasper",
    description: "AI copywriter that creates high-quality content for marketing and business.",
    category: "Writing",
    categories: ["writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://jasper.ai"
  }, {
    name: "Grammarly",
    description: "AI writing assistant that helps you write clearly and confidently.",
    category: "Writing",
    categories: ["writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://grammarly.com"
  }, {
    name: "Quillbot",
    description: "AI-powered paraphrasing tool and writing assistant.",
    category: "Writing",
    categories: ["writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://quillbot.com"
  },
  // Project Management tools
  {
    name: "Linear",
    description: "Issue tracking and project management tool built for software teams.",
    category: "Project Management",
    categories: ["collaboration"],
    complexity: "medium",
    setupComplexity: "simple",
    url: "https://linear.app"
  }, {
    name: "ClickUp",
    description: "All-in-one productivity platform with AI-powered project management.",
    category: "Project Management",
    categories: ["collaboration"],
    complexity: "medium",
    setupComplexity: "advanced",
    url: "https://clickup.com"
  }, {
    name: "Notion",
    description: "Connected workspace for notes, docs, projects, and knowledge management.",
    category: "Productivity",
    categories: ["collaboration", "focus"],
    complexity: "medium",
    setupComplexity: "simple",
    url: "https://notion.so"
  }
  ];
}
  const getUseCase = (tool: any, index: number) => {
    if (!userPreferences) {
      // Default use cases
      if (index === 0) return "Deep work and writing tasks";
      if (index === 1) return "Communication and collaboration";
      if (index === 2) return "Planning and organization";
      if (index % 3 === 0) return "Data analysis and insights";
      if (index % 3 === 1) return "Creative work and ideation";
      return "Research and learning";
    }

    // Personalized use cases based on preferences
    switch (userPreferences.priority) {
      case 'focus':
        return "Enhanced focus and deep work sessions";
      case 'automation':
        return "Streamlined workflows and task automation";
      case 'writing':
        return "Improved writing quality and speed";
      case 'collaboration':
        return "Better team coordination and project management";
      default:
        return "Productivity optimization";
    }
  };

  // Derived data and helpers
  const displayedTools = useMemo(() => personalizedTools.slice(0, 4), [personalizedTools]);

  const masteredCount = useMemo(
    () => displayedTools.filter((t: any) => completed[t.name]).length,
    [displayedTools, completed]
  );

  const coreMovesByTool: Record<string, string[]> = useMemo(() => ({
    "Notion AI": ["Turn a messy idea into an outline", "Draft a page in your voice", "Polish and fact‑check"],
    "ChatGPT Plus": ["Research and summarize faster", "Brainstorm variations", "Improve clarity + tone"],
    "Jasper": ["Generate ad copy", "Rewrite for brevity", "Turn bullets into paragraph"],
    "Grammarly": ["Fix clarity", "Adjust tone", "Proofread for errors"],
    "Motion": ["Auto-schedule tasks", "Block deep work", "Protect focus hours"],
    "Bardeen": ["Automate intake", "Scrape to sheet", "Trigger follow-ups"],
    "Zapier": ["Connect apps", "Create multi-step flows", "Use AI actions"],
    "Notion": ["Document a process", "Design a system", "Link databases"],
    "Superhuman": ["Triage with split inbox", "AI draft replies", "Create snippets"],
    "Linear": ["Plan sprints", "Link PRs", "Triage bugs"],
    "ClickUp": ["Define tasks", "Track progress", "Summarize updates"],
    "Quillbot": ["Paraphrase", "Cite sources", "Condense text"],
  }), []);

  useEffect(() => {
    displayedTools.forEach((t: any) => {
      setChecklists(prev => prev[t.name] ? prev : { ...prev, [t.name]: [false, false, false, false, false] });
    });
  }, [displayedTools]);

  const handleToggleChecklist = (toolName: string, i: number) => {
    setChecklists(prev => {
      const arr = prev[toolName]?.slice() ?? [false, false, false, false, false];
      arr[i] = !arr[i];
      return { ...prev, [toolName]: arr };
    });
  };

  const getChecklistProgress = (toolName: string) => {
    const arr = checklists[toolName] || [];
    const count = arr.filter(Boolean).length;
    return (count / 5) * 100;
  };

  const markComplete = (toolName: string) => {
    setCompleted(prev => ({ ...prev, [toolName]: true }));
    setChecklists(prev => ({ ...prev, [toolName]: [true, true, true, true, true] }));
  };

  const openMove = (toolName: string, move: string) => {
    setActiveTool(toolName);
    setActiveMove(move);
    setMoveInput("");
    setMoveSubmitted(false);
    setDrawerOpen(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Prompt copied to clipboard." });
  };

  const practiceItems = useMemo(() => {
    if (displayedTools.length < 2) return [] as { tool: string; move: string }[];
    const firstTwo = displayedTools.slice(0, 2);
    return firstTwo.map((t: any) => {
      const moves = coreMovesByTool[t.name] ?? ["Turn a messy idea into an outline","Draft a page in your voice","Polish and fact‑check"];
      return { tool: t.name, move: moves[0] };
    });
  }, [displayedTools, coreMovesByTool]);

  const startPractice = (item: { tool: string; move: string }) => {
    const el = toolRefs.current[item.tool];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    openMove(item.tool, item.move);
  };

      return (
        <div className="space-y-4">
          {/* Personalization modal */}
          <PersonalizationSurvey
            isOpen={showSurvey}
            onClose={() => setShowSurvey(false)}
            onComplete={handlePersonalizationComplete}
          />

          {/* Layout: Left menu + Flashcard main */}
          <div className="flex gap-6 min-h-[70vh]">
            {/* Left Menu */}
            <aside className="w-64 lg:w-72 shrink-0">
              <Card className="h-full p-4 flex flex-col">
                {/* Search */}
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="I need help with…"
                  className="mb-3"
                />

                {/* Tool list */}
                <div className="flex-1 overflow-auto space-y-1">
                  {flashcardTools.map((t, idx) => {
                    const Icon = categoryIcon(t.category);
                    const isActive = idx === currentToolIdx;
                    return (
                      <button
                        key={t.name}
                        onClick={() => { setCurrentToolIdx(idx); setStep(1); }}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-md border p-2 text-left",
                          isActive ? "bg-muted" : "hover:bg-muted/50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{t.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{t.category}</div>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                          {levelsCompleted(t.name)}/3
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Edit answers */}
                <div className="pt-3 mt-3 border-t">
                  <Button variant="outline" className="w-full" onClick={() => setShowSurvey(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit My Answers
                  </Button>
                </div>
              </Card>
            </aside>

            {/* Main Flashcard */}
            <main className="flex-1 flex items-start justify-center">
              <div className="w-full max-w-3xl animate-fade-in">
                {(() => {
                  const currentTool = flashcardTools[currentToolIdx];
                  if (!currentTool) return null;

                  const moves = coreMovesByTool[currentTool.name] ?? [
                    'Turn a messy idea into an outline',
                    'Draft a page in your voice',
                    'Polish and fact‑check',
                  ];
                  const useOptions = moves.slice(0, 3);
                  const chosenUse = selectedUseCases[currentTool.name] || '';
                  const chosenSkill = selectedSkillByTool[currentTool.name] || (userPreferences?.experienceLevel === 'advanced' ? 'advanced' : 'beginner');

                  const beginnerExplainer = 'A simple, safe first pass you can run in minutes. You’ll get a clean starting point and learn the basics.';
                  const advancedExplainer = 'A stronger, more structured prompt with constraints, assumptions, and checks to produce a high‑quality result.';

                  const beginnerPrompt = `You are helping me ${chosenUse ? chosenUse.toLowerCase() : 'get started quickly'}. Keep it simple. Create a short, numbered plan and one example output. Ask one clarifying question first.`;
                  const advancedPrompt = `Act as a ${currentTool.category.toLowerCase()} expert using ${currentTool.name}. For \"${chosenUse || 'this task'}\", produce a high‑quality result with: goals, constraints, assumptions, variants (2), and a final check list. Use clear headings.`;

                  const beginnerDone = !!levelProgress[currentTool.name]?.beginner;
                  const advancedDone = !!levelProgress[currentTool.name]?.advanced;
                  const completedCount = levelsCompleted(currentTool.name); // 0..2

                  return (
                    <>
                      <Card className="p-6 relative overflow-hidden">
                        {/* Subtle gradient header by category */}
                        <div className="absolute inset-x-0 -top-8 h-24 bg-gradient-to-r from-[hsl(var(--primary)/0.12)] to-[hsl(var(--accent)/0.12)] pointer-events-none" />

                        {/* Step indicator + meta */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">Step {step} of 3</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{currentTool.category}</Badge>
                            <span className="text-xs text-muted-foreground">{completedCount}/3 levels completed</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div key={step} className="animate-fade-in space-y-4">
                          {step === 1 && (
                            <div className="space-y-3">
                              <h1 className="text-3xl font-semibold leading-tight">{currentTool.name}</h1>
                              <p className="text-base text-muted-foreground">{currentTool.description}</p>
                              <div className="rounded-lg bg-accent/30 p-3">
                                <p className="text-sm">Used for: {getUseCase(currentTool, currentToolIdx)}</p>
                              </div>
                              <div className="pt-2">
                                <Button onClick={() => setStep(2)}>Select Tool</Button>
                              </div>
                            </div>
                          )}

                          {step === 2 && (
                            <div className="space-y-4">
                              <h2 className="text-xl font-medium">Choose a use case</h2>
                              <div className="flex flex-wrap gap-2">
                                {useOptions.map((u) => (
                                  <Button
                                    key={u}
                                    variant={chosenUse === u ? 'secondary' : 'outline'}
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => setSelectedUseCases(prev => ({ ...prev, [currentTool.name]: u }))}
                                  >
                                    {u}
                                  </Button>
                                ))}
                              </div>
                              <div className="pt-2 space-y-2">
                                <div className="text-sm text-muted-foreground">View</div>
                                <div className="flex gap-2">
                                  <Button variant={chosenSkill === 'beginner' ? 'secondary' : 'outline'} size="sm" onClick={() => setSelectedSkillByTool(prev => ({ ...prev, [currentTool.name]: 'beginner' }))}>Beginner</Button>
                                  <Button variant={chosenSkill === 'advanced' ? 'secondary' : 'outline'} size="sm" onClick={() => setSelectedSkillByTool(prev => ({ ...prev, [currentTool.name]: 'advanced' }))}>Advanced</Button>
                                </div>
                              </div>
                              <div className="pt-2 flex items-center gap-2">
                                <Button disabled={!chosenUse} onClick={() => setStep(3)}>Continue</Button>
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                              </div>
                            </div>
                          )}

                          {step === 3 && (
                            <div className="space-y-5">
                              <div>
                                <h2 className="text-xl font-medium">{chosenSkill === 'beginner' ? 'Beginner' : 'Advanced'} view</h2>
                                <p className="text-sm text-muted-foreground mt-1">{chosenSkill === 'beginner' ? beginnerExplainer : advancedExplainer}</p>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm font-medium">Copy this prompt</div>
                                <div className="rounded-lg border p-3 flex items-start justify-between gap-3">
                                  <p className="text-sm flex-1">{chosenSkill === 'beginner' ? beginnerPrompt : advancedPrompt}</p>
                                  <Button size="icon" variant="ghost" aria-label="Copy prompt" onClick={() => handleCopy(chosenSkill === 'beginner' ? beginnerPrompt : advancedPrompt)}>
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {chosenSkill === 'advanced' && (
                                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                  <li>Set clear goals and constraints up front.</li>
                                  <li>Ask one clarifying question before drafting.</li>
                                  <li>Provide two variants; compare and refine.</li>
                                </ul>
                              )}

                              <div className="flex flex-wrap items-center gap-2">
                                {!((chosenSkill === 'beginner' && beginnerDone) || (chosenSkill === 'advanced' && advancedDone)) && (
                                  <Button onClick={() => markLevelComplete(currentTool.name, chosenSkill)}>
                                    <Check className="w-4 h-4 mr-2" /> Mark {chosenSkill} complete
                                  </Button>
                                )}
                                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                                <Button onClick={() => window.open(currentTool.url || '#', '_blank')}>
                                  <ExternalLink className="w-4 h-4 mr-2" /> Try {currentTool.name}
                                </Button>
                              </div>

                              {/* Expert level gated upsell inside flashcard */}
                              <div className="rounded-lg border p-4 bg-muted/30">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-medium">Expert Level</div>
                                    <p className="text-xs text-muted-foreground">Automation ideas, integrations, chaining techniques</p>
                                  </div>
                                  {(beginnerDone && advancedDone) ? (
                                    <Badge variant="secondary">Unlocked</Badge>
                                  ) : (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Lock className="w-3 h-3 mr-1" /> Unlock with Pro
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Tool navigation */}
                      <div className="mt-4 flex items-center justify-between">
                        <Button
                          variant="outline"
                          disabled={currentToolIdx === 0}
                          onClick={() => { setCurrentToolIdx(i => Math.max(0, i - 1)); setStep(1); }}
                        >
                          Previous Tool
                        </Button>
                        <div className="text-sm text-muted-foreground">{currentToolIdx + 1} / {flashcardTools.length}</div>
                        <Button
                          onClick={() => { setCurrentToolIdx(i => Math.min(flashcardTools.length - 1, i + 1)); setStep(1); }}
                          disabled={currentToolIdx >= flashcardTools.length - 1}
                        >
                          Next Tool
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </main>
          </div>

          {/* Keep waitlist section */}
          <SystemUpgradeWaitlist />
        </div>
      );

    };
