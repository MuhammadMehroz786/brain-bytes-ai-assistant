import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Play, Users, Briefcase, Target } from "lucide-react";
import { EducationTool, StarterPath, UserPrefs } from "./types";
import { MasteryRing } from "../dashboard/MasteryRing";

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
  const [selectedPath, setSelectedPath] = useState("fast-track");

  const paths = [
    { id: "fast-track", title: "Fast Track", subtitle: "20 mins · 3 wins", icon: Play },
    { id: "writer", title: "Writer", subtitle: "Content creation", icon: Users },
    { id: "solopreneur", title: "Solopreneur", subtitle: "Business growth", icon: Briefcase },
    { id: "ops", title: "Ops", subtitle: "Process optimization", icon: Target },
  ];

  const filteredTools = useMemo(() => {
    let filtered = tools;
    if (recommendedOnly) {
      filtered = filtered.filter(t => t.recommended);
    }
    if (query) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      );
    }
    return filtered;
  }, [tools, query, recommendedOnly]);

  const starterProgress = useMemo(() => {
    const completed = starterPath.cards.filter(card => {
      const progress = getProgress(card.toolId);
      return progress.completedCards.includes(card.cardId);
    });
    return Math.round((completed.length / starterPath.cards.length) * 100);
  }, [starterPath, getProgress]);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Your Tools</h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          <Button
            variant={recommendedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setRecommendedOnly(true)}
            className="h-7"
          >
            <Filter className="h-3 w-3 mr-1" />
            Recommended
          </Button>
          <Button
            variant={!recommendedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setRecommendedOnly(false)}
            className="h-7"
          >
            All
          </Button>
        </div>
      </div>

      {/* Paths Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Learning Paths</h4>
        
        {/* Starter Path - Featured */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  {starterPath.title}
                </div>
                <div className="text-xs text-muted-foreground">3 wins to get started</div>
              </div>
              <MasteryRing size={24} progress={starterProgress} />
            </div>
            <div className="space-y-1">
              {starterPath.cards.map((card, i) => {
                const isCompleted = getProgress(card.toolId).completedCards.includes(card.cardId);
                return (
                  <button
                    key={i}
                    onClick={() => onSelect(card.toolId)}
                    className="w-full text-left text-xs p-2 rounded hover:bg-primary/10 flex items-center justify-between group"
                  >
                    <span className={isCompleted ? "line-through text-muted-foreground" : ""}>{card.title}</span>
                    <Badge variant={isCompleted ? "secondary" : "outline"} className="text-xs">
                      {isCompleted ? "Done" : `Step ${i+1}`}
                    </Badge>
                  </button>
                );
              })}
            </div>
            <Button size="sm" className="w-full mt-3 h-7" onClick={() => onSelect(starterPath.cards[0].toolId)}>
              Start Path
            </Button>
          </CardContent>
        </Card>

        {/* Other Paths */}
        <div className="grid grid-cols-2 gap-2">
          {paths.slice(1).map((path) => {
            const Icon = path.icon;
            return (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                className="p-2 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{path.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">{path.subtitle}</div>
              </button>
            );
          })}
        </div>
        
        <Button variant="link" size="sm" className="w-full h-6 text-xs">
          Browse all paths
        </Button>
      </div>

      {/* Tool List */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {recommendedOnly ? 'Recommended for you' : 'Explore'}
        </h4>
        <div className="space-y-2">
          {filteredTools.map((tool) => {
            const progress = getProgress(tool.id);
            const nextCard = tool.cards.find(c => !progress.completedCards.includes(c.id));
            return (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className="w-full text-left p-3 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <tool.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{tool.name}</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{tool.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {nextCard ? nextCard.title.replace(" (≈3 min)", "") : "Completed"}
                    </div>
                  </div>
                  <MasteryRing size={24} progress={progress.percent} />
                </div>
              </button>
            );
          })}
        </div>
        
        {filteredTools.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-muted-foreground">Tell us what you do and we'll pick a starting set.</p>
            <Button variant="link" size="sm" onClick={() => setPrefs({...prefs})}>
              Edit My Answers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolPicker;
