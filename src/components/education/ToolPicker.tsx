import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MasteryRing from "@/components/dashboard/MasteryRing";
import { EducationTool, StarterPath, UserPrefs } from "./types";
import { Search, Pencil } from "lucide-react";

interface ToolPickerProps {
  prefs: UserPrefs;
  setPrefs: (p: UserPrefs) => void;
  tools: EducationTool[];
  starterPath: StarterPath;
  onSelect: (toolId: string) => void;
  getProgress: (toolId: string) => { percent: number; completedCards: string[] };
}

const ToolPicker = ({ prefs, setPrefs, tools, starterPath, onSelect, getProgress }: ToolPickerProps) => {
  const [query, setQuery] = useState("");
  const [recommendedOnly, setRecommendedOnly] = useState(true);

  const filtered = useMemo(() => {
    const base = recommendedOnly ? tools.filter(t => t.recommended) : tools;
    return base.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase()));
  }, [tools, query, recommendedOnly]);

  return (
    <div className="p-4 space-y-4">
      <div className="px-2 pt-3 pb-2">
        <h2 className="text-sm font-semibold">Your Tools</h2>
        <p className="text-xs text-muted-foreground">Fast Track (20 mins)</p>
      </div>

      {/* Starter Path */}
      <Card className="mx-2">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Fast Track (20 mins) · {starterPath.cards.length} wins</div>
              <div className="text-xs text-muted-foreground">Continue where you left off</div>
            </div>
            <MasteryRing size={40} progress={starterPath.progressPercent} />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {starterPath.cards.map((c) => (
              <button key={c.cardId} className="text-left text-sm hover:underline" onClick={() => onSelect(c.toolId)}>
                • {c.title}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-3 w-full">Start Path</Button>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="I need help with…" className="pl-9" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={recommendedOnly ? "default" : "secondary"} className="cursor-pointer" onClick={() => setRecommendedOnly(true)}>Recommended</Badge>
          <Badge variant={!recommendedOnly ? "default" : "secondary"} className="cursor-pointer" onClick={() => setRecommendedOnly(false)}>All</Badge>
        </div>
      </div>

      {/* Tools */}
      <div className="px-2 space-y-2">
        {filtered.map((t) => {
          const p = getProgress(t.id);
          return (
            <button key={t.id} onClick={() => onSelect(t.id)} className="w-full text-left p-2 rounded-lg border hover:bg-secondary transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${t.gradient[0]}), hsl(${t.gradient[1]}))` }}>
                  <t.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {t.name}
                    <span className="text-[11px] text-muted-foreground">{t.category}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">Next: {t.nextLabel}</div>
                </div>
                <MasteryRing size={36} progress={p.percent} />
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-xs text-muted-foreground p-3 border rounded-lg">
            Tell us what you do and we’ll pick a starting set. <button className="underline" onClick={() => setPrefs({ ...prefs, openRefine: true })}>Refine answers</button>
          </div>
        )}
      </div>

      {/* Edit answers */}
      <div className="p-2 pt-4">
        <Button variant="ghost" className="w-full justify-start"><Pencil className="h-4 w-4 mr-2" />Edit My Answers</Button>
      </div>
    </div>
  );
};

export default ToolPicker;
