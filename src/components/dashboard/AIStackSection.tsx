import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, ExternalLink, Star } from "lucide-react";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface AIStackSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const AIStackSection = ({ plan, responses }: AIStackSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Your AI Productivity Stack</h2>
          <p className="text-muted-foreground">
            Carefully selected tools that match your work style and productivity goals
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Zap className="w-4 h-4 mr-1" />
          {plan.aiTools.length} Tools
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plan.aiTools.map((tool, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
            <div className="space-y-4">
              {/* Tool header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-primary/20 p-2">
                    <img 
                      src={`https://logo.clearbit.com/${tool.name.toLowerCase().replace(/\s+/g, '')}.com`}
                      alt={`${tool.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Zap className="w-6 h-6 text-primary hidden" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{tool.name}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Recommended
                </Badge>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {tool.description}
              </p>

              {/* Associated time block */}
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    Best for
                  </Badge>
                </div>
                <p className="text-sm text-foreground">
                  {index === 0 && "Deep work and focus sessions"}
                  {index === 1 && "Communication and collaboration"}
                  {index === 2 && "Planning and organization"}
                  {index % 3 === 0 && index > 0 && "Analysis and reporting"}
                  {index % 3 === 1 && index > 1 && "Creative work"}
                  {index % 3 === 2 && index > 2 && "Learning and research"}
                </p>
              </div>

              {/* Video embed placeholder */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Quick Demo</span>
                  <Badge variant="outline" className="text-xs">2 min</Badge>
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                  <Play className="w-8 h-8 text-muted-foreground" />
                </div>
                <Button variant="ghost" size="sm" className="w-full rounded-xl">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Setup Guide
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Try {tool.name}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Stack summary */}
      <Card className="p-6 bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
        <div className="text-center">
          <h4 className="font-semibold text-foreground mb-2">Your Complete AI Stack</h4>
          <p className="text-muted-foreground text-sm mb-4">
            These tools work together to address your main challenge: {responses.productivityStruggle.toLowerCase()}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="rounded-xl">
              Download Tool List
            </Button>
            <Button className="rounded-xl">
              Get All Tools (Save 40%)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};