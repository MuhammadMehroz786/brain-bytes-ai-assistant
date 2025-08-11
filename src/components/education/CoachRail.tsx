import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EducationCard, EducationTool } from "./types";
import { Keyboard, HelpCircle } from "lucide-react";

interface CoachRailProps {
  tool: EducationTool;
  card: EducationCard;
  beginner: boolean;
  onAsk: () => void;
}

const CoachRail = ({ tool, card, beginner, onAsk }: CoachRailProps) => {
  return (
    <div className="p-4 space-y-3">
      <div className="px-2 pt-1">
        <h3 className="text-sm font-semibold">Coach</h3>
      </div>

      <Card className="mx-2">
        <CardContent className="p-3 space-y-2 text-sm">
          <div className="font-medium flex items-center gap-2"><Keyboard className="h-4 w-4" /> Shortcuts</div>
          <ul className="list-disc list-inside text-muted-foreground">
            {tool.shortcuts.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Card className="mx-2">
        <CardContent className="p-3 space-y-2 text-sm">
          <div className="font-medium">Common mistakes</div>
          <ul className="list-disc list-inside text-muted-foreground">
            {card.mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </CardContent>
      </Card>

      {beginner && (
        <Card className="mx-2">
          <CardContent className="p-3 text-xs text-muted-foreground">
            Why this works: {card.whyThisWorks}
          </CardContent>
        </Card>
      )}

      <div className="px-2">
        <Button className="w-full" onClick={onAsk}><HelpCircle className="h-4 w-4 mr-2" />Ask the Assistant</Button>
      </div>
    </div>
  );
};

export default CoachRail;
