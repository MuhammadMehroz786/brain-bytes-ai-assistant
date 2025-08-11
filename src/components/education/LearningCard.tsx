import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { EducationCard, EducationTool, UserPrefs } from "./types";
import { Copy, ExternalLink } from "lucide-react";

interface LearningCardProps {
  prefs: UserPrefs;
  setPrefs: (p: UserPrefs) => void;
  tool: EducationTool;
  card: EducationCard;
  onCopy: () => void;
  onOpenTool: () => void;
  onMarkMastery: () => void;
  onNext: () => void;
}

const LearningCard = ({ prefs, setPrefs, tool, card, onCopy, onOpenTool, onMarkMastery }: LearningCardProps) => {
  const { toast } = useToast();
  const [level, setLevel] = useState(prefs.skill === 'advanced' ? 'advanced' : 'beginner');
  const [vars, setVars] = useState(() => ({ ...card.defaults }));

  const prompt = useMemo(() => {
    const body = (level === 'beginner' ? card.prompt.beginner : card.prompt.advanced) || card.prompt.beginner;
    return body
      .replaceAll("[[Topic]]", vars.Topic || "your topic")
      .replaceAll("[[Audience]]", vars.Audience || "your audience")
      .replaceAll("[[Tone]]", vars.Tone || "Friendly")
      .replaceAll("[[Length]]", vars.Length || "Medium")
      .replaceAll("[[Must-include bullets]]", vars["Must-include bullets"] || "• point 1\n• point 2");
  }, [vars, level, card]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({ title: "Prompt copied" });
      onCopy();
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const openInTool = () => {
    onOpenTool();
    const url = tool.openUrl || "https://www.notion.so";
    const win = window.open(url, "_blank");
    if (!win) {
      toast({ title: "Couldn’t open tool", description: "Open your tool and paste the prompt.", variant: "destructive" });
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-4 md:px-6 py-3 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="text-xs text-muted-foreground">Card {card.step} of {tool.cards.length} · {tool.category}</div>
        <div className="flex items-center gap-1 text-xs">
          <Button variant={level === 'beginner' ? 'default' : 'secondary'} size="sm" onClick={() => { setLevel('beginner'); setPrefs({ ...prefs, skill: 'beginner' })}}>Beginner</Button>
          <Button variant={level === 'advanced' ? 'default' : 'secondary'} size="sm" onClick={() => { setLevel('advanced'); setPrefs({ ...prefs, skill: 'advanced' })}}>Advanced</Button>
        </div>
      </div>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">{card.title}</h2>
          <div className="mt-1 text-xs text-muted-foreground">~3 min</div>
        </div>

        {/* Quick Steps */}
        <div className="space-y-1">
          {card.quickSteps.slice(0,3).map((s, i) => (
            <div key={i} className="text-sm">{i+1}. {s}</div>
          ))}
        </div>

        <Separator />

        {/* Variables chips mini-form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(card.defaults).map((k) => (
            <div key={k} className="space-y-1">
              <div className="text-xs text-muted-foreground">{k}</div>
              <Input value={vars[k] || ""} onChange={(e) => setVars(v => ({ ...v, [k]: e.target.value }))} placeholder={k} />
            </div>
          ))}
        </div>

        {/* Prompt */}
        <div className="rounded-lg border bg-secondary p-3">
          <div className="text-[11px] text-muted-foreground mb-1">Prompt Template</div>
          <pre className="whitespace-pre-wrap text-sm">{prompt}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={copyPrompt}><Copy className="h-4 w-4 mr-2" />Copy prompt</Button>
            <Button size="sm" variant="secondary" onClick={openInTool}><ExternalLink className="h-4 w-4 mr-2" />Open in {tool.name}</Button>
          </div>
        </div>

        {/* Pitfalls */}
        {level === 'beginner' && (
          <details className="rounded-lg border p-3 bg-background/50">
            <summary className="text-sm font-medium cursor-pointer">Show tips</summary>
            <ul className="mt-2 list-disc list-inside text-sm space-y-1">
              {card.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={onMarkMastery}>I did this</Button>
          <Button variant="ghost">Save as template</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningCard;
