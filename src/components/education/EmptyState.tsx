import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  onStart: () => void;
  nextCard: string;
}

const EmptyState = ({ onStart, nextCard }: EmptyStateProps) => {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center space-y-6 p-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Your Starter Path is ready</h3>
          <p className="text-muted-foreground">Start with: {nextCard}</p>
        </div>
        
        <Button onClick={onStart} className="gap-2">
          Start
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;