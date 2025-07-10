import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp, Heart, MessageSquare, ExternalLink, Upload, Filter } from "lucide-react";

export const CommunityPicksSection = () => {
  const [filter, setFilter] = useState("all");
  const communityPicks = [
    {
      type: "tool",
      title: "Editor's Pick",
      name: "Notion AI",
      description: "Advanced note-taking with AI-powered writing assistance",
      category: "Knowledge Management",
      trending: "Top pick for Deep Work",
      icon: "🧠"
    },
    {
      type: "prompt", 
      title: "Top Choice",
      name: "Strategic Planning Assistant",
      description: "Breaks down complex goals into actionable quarterly plans",
      category: "Planning",
      trending: "Most copied prompt this week",
      icon: "🎯"
    },
    {
      type: "stack",
      title: "Editor's Pick", 
      name: "The Creator's Toolkit",
      description: "Notion + Claude + Canva for content creators",
      category: "Content Creation",
      trending: "Fastest growing workflow",
      icon: "🎨"
    },
    {
      type: "tool",
      title: "Top Choice",
      name: "Todoist",
      description: "Smart task management with natural language processing",
      category: "Task Management", 
      trending: "Best for GTD methodology",
      icon: "✅"
    },
    {
      type: "prompt",
      title: "Editor's Pick",
      name: "Weekly Review Assistant", 
      description: "Comprehensive reflection and planning prompt",
      category: "Reflection",
      trending: "Perfect for Sunday planning",
      icon: "📝"
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

  const filteredPicks = filter === "all" ? communityPicks : communityPicks.filter(pick => pick.type === filter);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success/10 to-primary/10 rounded-2xl border border-success/20 mb-4">
          <Users className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">What's Working for Other Brain Bytes Readers</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the tools, prompts, and setups that are helping productivity enthusiasts achieve their goals
        </p>
        
        {/* Filter buttons */}
        <div className="flex justify-center gap-2 mt-6">
          {["all", "tool", "prompt", "stack"].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="rounded-xl capitalize"
            >
              {filterType === "all" ? "All" : filterType + "s"}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredPicks.map((pick, index) => {
          const Icon = getIcon(pick.type);
          
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4">
                {/* Icon and emoji */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl">{pick.icon}</div>
                  <div className="w-8 h-8 bg-gradient-to-br from-success/10 to-accent/10 rounded-lg flex items-center justify-center border border-success/20">
                    <Icon className="w-4 h-4 text-success" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{pick.name}</h4>
                        <Badge variant="secondary" className="text-xs">{pick.title}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                        {pick.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-medium">{pick.trending}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Try
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