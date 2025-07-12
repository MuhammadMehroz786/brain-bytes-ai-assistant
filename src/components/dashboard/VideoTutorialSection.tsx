import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  ExternalLink,
  Video,
  BookOpen,
  Lightbulb
} from "lucide-react";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  embedUrl: string;
  thumbnail?: string;
  category: string;
}

const tutorials: Tutorial[] = [
  {
    id: "getting-started",
    title: "Getting Started with Brain Bytes",
    description: "Learn how to set up your productivity dashboard and create your first AI plan",
    duration: "2:30",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    category: "Getting Started"
  },
  {
    id: "ai-assistant",
    title: "Using Your AI Assistant Effectively",
    description: "Discover how to get the most out of your personalized AI productivity coach",
    duration: "3:45",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    category: "AI Features"
  },
  {
    id: "focus-techniques",
    title: "Focus Techniques That Actually Work",
    description: "Science-backed methods to improve concentration and productivity",
    duration: "4:20",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    category: "Productivity Tips"
  }
];

export const VideoTutorialSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Video className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Video Tutorials</h3>
          <p className="text-sm text-muted-foreground">Learn how to maximize your productivity</p>
        </div>
      </div>

      {/* Placeholder for main tutorial */}
      <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-foreground">
              Watch how to use your AI assistant in under 60 seconds
            </h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Quick tutorial coming soon! Get the most out of Brain Bytes with our step-by-step guide.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Video Coming Soon
          </Badge>
        </div>
      </Card>

      {/* Tutorial Grid */}
      <div className="grid gap-4">
        {tutorials.map((tutorial) => (
          <Card 
            key={tutorial.id}
            className="p-4 bg-white/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail Placeholder */}
              <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground text-sm leading-tight">
                      {tutorial.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tutorial.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {tutorial.duration}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {tutorial.category}
                  </Badge>
                  <Button size="sm" variant="ghost" className="ml-auto h-7 px-2 text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Watch
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="p-4 bg-gradient-to-r from-accent/5 to-primary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-medium text-foreground text-sm">Quick Tip</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Start with short 25-minute focus sessions and gradually increase duration as you build your concentration muscle.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};