import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Menu, Sparkles } from "lucide-react";
import ToolPicker from "@/components/education/ToolPicker";
import LearningCard from "@/components/education/LearningCard";
import CoachRail from "@/components/education/CoachRail";
import { EducationTool, StarterPath, UserPrefs } from "@/components/education/types";
import { EDUCATION_DATA } from "@/components/education/data";
import { useEducationProgress } from "@/hooks/useEducationProgress";
import { useAnalytics } from "@/hooks/useAnalytics";

const AIEducationHub = () => {
  const { toast } = useToast();
  const analytics = useAnalytics();
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);
  const [mobileTipsOpen, setMobileTipsOpen] = useState(false);

  // Load persisted answers (minimal Sprint 1 personalization)
  const [prefs, setPrefs] = useState<UserPrefs>(() => {
    const raw = localStorage.getItem("aihub:prefs");
    return raw ? JSON.parse(raw) : { skill: "beginner" };
  });

  // Tools and starter path
  const tools: EducationTool[] = EDUCATION_DATA.tools;
  const starterPath: StarterPath = useMemo(() => EDUCATION_DATA.getStarterPath(prefs), [prefs]);

  // Current selection
  const [activeToolId, setActiveToolId] = useState<string>(starterPath.cards[0]?.toolId || tools[0].id);
  const [activeCardId, setActiveCardId] = useState<string>(starterPath.cards[0]?.cardId || tools[0].cards[0].id);

  const { getToolProgress, markCardComplete } = useEducationProgress();

  const activeTool = tools.find(t => t.id === activeToolId) || tools[0];
  const activeCard = activeTool.cards.find(c => c.id === activeCardId) || activeTool.cards[0];

  useEffect(() => {
    document.title = "AI Education Hub | Learn AI by doing";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Learn AI by doing — tiny wins, step by step. Transform messy ideas into clear results in under 3 minutes per card.');
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Learn AI by doing — tiny wins, step by step. Transform messy ideas into clear results in under 3 minutes per card.';
      document.head.appendChild(m);
    }
    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.origin + '/education';
  }, []);

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
    toast({ title: "Nice! +1 step toward your goal.", description: "Saved to My Templates.", });
    analytics.track('mark_mastery', { toolId: activeToolId, cardId: activeCardId });
    // Suggest next card in same tool or starter path
    const tool = tools.find(t => t.id === activeToolId)!;
    const remaining = tool.cards.find(c => !getToolProgress(activeToolId).completedCards?.includes(c.id));
    if (remaining) setActiveCardId(remaining.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-success/5">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">AI Education Hub</h1>
            <p className="text-xs text-muted-foreground">Learn AI by doing — tiny wins, step by step.</p>
          </div>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={mobilePickerOpen} onOpenChange={setMobilePickerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm"><Menu className="h-4 w-4 mr-2" />Tools</Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-96 p-0">
              <ToolPicker
                prefs={prefs}
                setPrefs={(p) => { setPrefs(p); localStorage.setItem('aihub:prefs', JSON.stringify(p)); }}
                tools={tools}
                starterPath={starterPath}
                onSelect={id => { handleSelectTool(id); setMobilePickerOpen(false); }}
                getProgress={getToolProgress}
              />
            </SheetContent>
          </Sheet>
          <Sheet open={mobileTipsOpen} onOpenChange={setMobileTipsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">Tips</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-80 p-0">
              <CoachRail tool={activeTool} card={activeCard} onAsk={() => analytics.track('ask_assistant', { toolId: activeToolId, cardId: activeCardId })} beginner={prefs.skill !== 'advanced'} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)_280px] gap-4 md:gap-6">
        {/* Left: Tool Picker */}
        <aside className="hidden md:block">
          <Card className="sticky top-4">
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
        </aside>

        {/* Center: Big Learning Card */}
        <main>
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
        </main>

        {/* Right: Coach Rail */}
        <aside className="hidden md:block">
          <Card className="sticky top-4">
            <CardContent className="p-0">
              <CoachRail tool={activeTool} card={activeCard} onAsk={() => analytics.track('ask_assistant', { toolId: activeToolId, cardId: activeCardId })} beginner={prefs.skill !== 'advanced'} />
            </CardContent>
          </Card>
        </aside>
      </div>

      <footer className="sr-only">
        <Separator />
      </footer>
    </div>
  );
};

export default AIEducationHub;
