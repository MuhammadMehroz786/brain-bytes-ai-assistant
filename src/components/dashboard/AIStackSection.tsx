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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import MasteryRing from "./MasteryRing";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, ExternalLink, Star, Settings, Lightbulb, Lock, Copy, Check, ListChecks, ClipboardCheck, Sparkles, ArrowRight, Target, Pencil, Palette, Bot, Calendar } from "lucide-react";
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
  const getToolDatabase = () => [
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
  }];
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

  return <div className="space-y-6">
      {/* Page header */}
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your AI Productivity Toolkit</h2>
            <p className="text-muted-foreground">A tiny, curated AI stack you’ll actually master—guided step‑by‑step.</p>

            {/* Personalization strip */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-[1px] rounded-full">
                <div className="rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs flex items-center gap-2">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="font-medium">{userPreferences?.priority ?? "focus"}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-[1px] rounded-full">
                <div className="rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs flex items-center gap-2">
                  <span className="text-muted-foreground">Skill</span>
                  <span className="font-medium">{userPreferences?.experienceLevel ?? "beginner"}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-[1px] rounded-full">
                <div className="rounded-full bg-background/60 backdrop-blur px-3 py-1 text-xs flex items-center gap-2">
                  <span className="text-muted-foreground">Preferred</span>
                  <span className="font-medium">{userPreferences?.toolPreference ?? "simple"}</span>
                </div>
              </div>
              <button onClick={() => setShowSurvey(true)} className="text-xs underline underline-offset-4 text-primary hover:opacity-80 ml-2">Edit</button>
            </div>
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Simulate empty</span>
              <Switch checked={simulateEmpty} onCheckedChange={setSimulateEmpty} />
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="w-4 h-4 mr-1" />
              {displayedTools.length} Tools
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Stack mastered: {masteredCount}/{displayedTools.length} tools</span>
          <div className="flex-1"><Progress value={displayedTools.length ? (masteredCount / displayedTools.length) * 100 : 0} /></div>
        </div>

        {/* Mobile practice trigger */}
        <div className="flex sm:hidden">
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => setPracticeOpen(true)}>
            <Lightbulb className="w-4 h-4 mr-2" /> Today’s practice
          </Button>
        </div>
      </header>

      <PersonalizationSurvey isOpen={showSurvey} onClose={() => setShowSurvey(false)} onComplete={handlePersonalizationComplete} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {simulateEmpty ? (
            <Card className="p-6 text-center">
              <CardTitle className="text-lg">We’re re‑curating your stack</CardTitle>
              <CardDescription className="mt-2">Adjust your goals or try these editor’s picks.</CardDescription>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Notion AI','ChatGPT Plus','Grammarly'].map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </Card>
          ) : (
            displayedTools.map((tool: any, index: number) => {
              const moves = coreMovesByTool[tool.name] ?? [
                "Turn a messy idea into an outline",
                "Draft a page in your voice",
                "Polish and fact‑check",
              ];
              const checklistLabels = [
                "Create your account",
                "Set up one workspace/integration",
                "Run your first core move",
                "Save one reusable prompt/snippet",
                "Reflect on results",
              ];
              const progress = completed[tool.name] ? 100 : getChecklistProgress(tool.name);
              return (
                <Card key={tool.name} ref={(el) => (toolRefs.current[tool.name] = el)} className="p-6">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{tool.name}</h3>
                        <Badge variant="secondary" className="text-xs">{tool.category}</Badge>
                        <Badge variant="outline" className="text-xs">Recommended</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => window.open(tool.url || tool.affiliateLink || '#', '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" /> Try
                    </Button>
                  </div>

                  {/* Illustration */}
                  <div className="mt-4 rounded-xl border bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--accent))]/10 p-5">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm">No video — learn by doing with guided modules below.</span>
                    </div>
                  </div>

                  {/* Perfect for */}
                  <div className="mt-3 rounded-lg bg-accent/30 p-3">
                    <p className="text-sm">Perfect for: {getUseCase(tool, index)}</p>
                  </div>

                  {/* Modules */}
                  <div className="mt-5 grid md:grid-cols-2 gap-5">
                    {/* Three Core Moves */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <h4 className="font-medium">Three Core Moves</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {moves.map((m) => (
                          <Button key={m} variant="outline" size="sm" className="rounded-full" onClick={() => openMove(tool.name, m)}>
                            {m}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* QuickStart Guide */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4" />
                          <h4 className="font-medium">QuickStart Guide</h4>
                        </div>
                        <MasteryRing size={40} strokeWidth={5} progress={progress} />
                      </div>
                      <ul className="space-y-2">
                        {checklistLabels.map((label, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Checkbox id={`${tool.name}-step-${i}`} checked={!!checklists[tool.name]?.[i]} onCheckedChange={() => handleToggleChecklist(tool.name, i)} />
                            <label htmlFor={`${tool.name}-step-${i}`} className="text-sm leading-none">
                              {label}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prompt Pack */}
                    <div className="space-y-3 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4" />
                        <h4 className="font-medium">Prompt Pack</h4>
                      </div>
                      <Tabs defaultValue="starter" className="w-full">
                        <TabsList>
                          <TabsTrigger value="starter">Starter</TabsTrigger>
                          <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>
                        <TabsContent value="starter" className="space-y-2">
                          {[
                            "Summarize this article in 5 bullet points with a key takeaway.",
                            "Turn these notes into an outline with H2/H3 headings.",
                            "Rewrite this paragraph to be clearer and more concise.",
                          ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                              <p className="text-sm pr-3">{p}</p>
                              <Button size="icon" variant="ghost" onClick={() => handleCopy(p)} aria-label="Copy prompt">
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="advanced" className="space-y-2">
                          {[
                            "Act as an expert editor. Improve clarity, structure, and factuality. Flag weak claims.",
                            "Create a structured brief: audience, outcomes, tone, constraints, success metric.",
                            "Generate 3 style variants: casual, concise, and analytical.",
                          ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                              <p className="text-sm pr-3">{p}</p>
                              <Button size="icon" variant="ghost" onClick={() => handleCopy(p)} aria-label="Copy prompt">
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Templates (Locked) */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4" />
                        <h4 className="font-medium">Templates (Locked)</h4>
                        <span className="text-xs text-muted-foreground">Unlock with Pro for full workflows.</span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {['Writing brief','Research tracker','Slide outline'].map((t) => (
                          <div key={t} className="rounded-lg border p-3 text-sm flex items-center justify-between">
                            <span>{t}</span>
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MasteryRing size={48} progress={progress} />
                      <span className="text-sm text-muted-foreground">Mastery</span>
                    </div>
                    <Button onClick={() => markComplete(tool.name)} className="">
                      <Check className="w-4 h-4 mr-2" /> Mark complete
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right rail */}
        <aside className="hidden lg:block space-y-4 sticky top-16 self-start">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4" />
              <h4 className="font-medium">Today’s practice</h4>
            </div>
            <div className="space-y-2">
              {practiceItems.map((it) => (
                <div key={it.tool} className="rounded-lg border p-3">
                  <div className="text-sm font-medium">{it.move}</div>
                  <div className="text-xs text-muted-foreground mb-2">{it.tool}</div>
                  <Button size="sm" variant="secondary" onClick={() => startPractice(it)}>Start</Button>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" />
              <h4 className="font-medium">Common pitfalls</h4>
            </div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Over‑collecting prompts without testing.</li>
              <li>Skipping a simple first prototype.</li>
              <li>No feedback loop or reflection.</li>
            </ul>
          </Card>
        </aside>
      </div>

      {/* Mobile practice bottom sheet */}
      <Drawer open={practiceOpen} onOpenChange={setPracticeOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Today’s practice</DrawerTitle>
            <DrawerDescription>Pick a move to try now.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            {practiceItems.map((it) => (
              <div key={it.tool} className="rounded-lg border p-3">
                <div className="text-sm font-medium">{it.move}</div>
                <div className="text-xs text-muted-foreground mb-2">{it.tool}</div>
                <Button size="sm" variant="secondary" onClick={() => { setPracticeOpen(false); startPractice(it); }}>Start</Button>
              </div>
            ))}
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setPracticeOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Learn-by-doing drawer (right) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{activeMove}</SheetTitle>
            <SheetDescription>{activeTool}</SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-5">
            <section>
              <h5 className="text-sm font-medium mb-1">What you’ll do</h5>
              <p className="text-sm text-muted-foreground">You’ll practice “{activeMove}” inside your current workflow. Expect a tight, 5–10 minute run‑through to build muscle memory.</p>
            </section>
            <section>
              <h5 className="text-sm font-medium mb-1">Copy this prompt</h5>
              <div className="rounded-lg border p-3 flex items-start justify-between gap-3">
                <p className="text-sm flex-1">Act as an expert assistant. {activeMove}. Keep it concise, numbered, and ask one clarifying question first.</p>
                <Button size="icon" variant="ghost" onClick={() => handleCopy(`Act as an expert assistant. ${activeMove}. Keep it concise, numbered, and ask one clarifying question first.`)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </section>
            <section>
              <h5 className="text-sm font-medium mb-1">Try it now</h5>
              {!moveSubmitted ? (
                <div className="space-y-2">
                  <textarea value={moveInput} onChange={(e) => setMoveInput(e.target.value)} className="w-full min-h-[120px] rounded-md border bg-background p-3 text-sm" placeholder="Paste notes or write a short brief…" />
                  <Button onClick={() => setMoveSubmitted(true)}>Submit</Button>
                </div>
              ) : (
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium mb-1">Success</p>
                  <p className="text-sm text-muted-foreground">Nice — that’s a clean first pass. Save the best parts and run the next move.</p>
                </div>
              )}
            </section>
            <section>
              <h5 className="text-sm font-medium mb-1">Why it works</h5>
              <p className="text-sm text-muted-foreground">These moves turn vague goals into concrete actions with feedback. Repetition builds your personal library of prompts and patterns.</p>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sticky Pro panel */}
      <div className="fixed inset-x-4 bottom-4 z-40 rounded-xl border bg-background/80 backdrop-blur shadow-lg p-4 md:flex md:items-center md:justify-between">
        <div>
          <div className="font-semibold">Go further with Pro</div>
          <div className="text-sm text-muted-foreground">Advanced playbooks • Template library • Auto‑schedule + Gmail sync • Monthly live sessions</div>
        </div>
        <div className="mt-3 md:mt-0">
          <Button onClick={() => setProOpen(true)} className="">See Pro plan</Button>
        </div>
      </div>

      <Sheet open={proOpen} onOpenChange={setProOpen}>
        <SheetContent side="bottom" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Pro Plan (Preview)</SheetTitle>
            <SheetDescription>Read‑only feature sheet</SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-2 text-sm">
            <p>• Advanced playbooks with end‑to‑end workflows</p>
            <p>• Full template library with updates</p>
            <p>• Auto‑schedule sessions + Gmail sync</p>
            <p>• Monthly live practice sessions</p>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setProOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* System Upgrade Waitlist (kept) */}
      <SystemUpgradeWaitlist />
    </div>;

};