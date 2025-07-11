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

      <div className="grid md:grid-cols-2 gap-4">
        {plan.aiTools.map((tool, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-all duration-200">
            <div className="space-y-3">
              {/* Tool header - compact */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-primary/20 p-1">
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
                    <Zap className="w-4 h-4 text-primary hidden" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{tool.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Recommended
                </Badge>
              </div>

              {/* Description - shortened */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.description.length > 100 ? tool.description.substring(0, 100) + "..." : tool.description}
              </p>

              {/* Associated time block - compact */}
              <div className="bg-muted/20 rounded p-2">
                <p className="text-xs text-foreground">
                  Best for: {index === 0 && "Deep work"}
                  {index === 1 && "Communication"}
                  {index === 2 && "Planning"}
                  {index % 3 === 0 && index > 0 && "Analysis"}
                  {index % 3 === 1 && index > 1 && "Creative work"}
                  {index % 3 === 2 && index > 2 && "Research"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 rounded-xl"
                  onClick={() => window.open('https://quillbot.com', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Try {tool.name}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Star className="w-3 h-3" />
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