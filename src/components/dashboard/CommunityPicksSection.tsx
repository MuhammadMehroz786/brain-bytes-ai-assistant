import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp, Heart, MessageSquare, ExternalLink, Upload } from "lucide-react";

export const CommunityPicksSection = () => {
  const communityPicks = [
    {
      type: "tool",
      title: "Editor's Pick",
      name: "Notion AI",
      description: "Advanced note-taking with AI-powered writing assistance",
      category: "Knowledge Management",
      testimonial: "Game-changer for organizing thoughts and ideas"
    },
    {
      type: "prompt",
      title: "Top Choice",
      name: "Strategic Planning Assistant",
      description: "Breaks down complex goals into actionable quarterly plans",
      category: "Planning",
      testimonial: "Helped me achieve 3 major goals this quarter"
    },
    {
      type: "stack",
      title: "Editor's Pick",
      name: "The Creator's Toolkit",
      description: "Notion + Claude + Canva for content creators",
      category: "Content Creation",
      testimonial: "Perfect combination for my content workflow"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'tool': return Star;
      case 'prompt': return MessageSquare;
      case 'stack': return TrendingUp;
      default: return Star;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success/10 to-primary/10 rounded-2xl border border-success/20 mb-4">
          <Users className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">What's Working for Other Brain Bytes Readers</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the tools, prompts, and setups that are helping thousands of productivity enthusiasts achieve their goals
        </p>
      </div>

      <div className="space-y-6">
        {communityPicks.map((pick, index) => {
          const Icon = getIcon(pick.type);
          
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-success/10 to-accent/10 rounded-xl flex items-center justify-center border border-success/20">
                      <Icon className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-success">{pick.title}</p>
                      <h4 className="font-semibold text-foreground">{pick.name}</h4>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {pick.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      {pick.description}
                    </p>
                    
                    <div className="bg-gradient-to-r from-success/5 to-primary/5 rounded-lg p-3 border border-success/10">
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-success mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Community Feedback</p>
                          <p className="text-sm text-muted-foreground italic">"{pick.testimonial}"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full rounded-xl">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Try It
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submit your pick */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl border border-primary/20">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-2">Share Your Success</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Found a tool or workflow that's working amazing for you? Help other Brain Bytes readers discover it too.
            </p>
          </div>
          
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="rounded-xl">
              <MessageSquare className="w-4 h-4 mr-2" />
              Share a Tool
            </Button>
            <Button className="rounded-xl">
              <Upload className="w-4 h-4 mr-2" />
              Submit Your Stack
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
};