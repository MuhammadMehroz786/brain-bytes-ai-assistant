import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Zap, Play, ExternalLink, Star, PlayCircle } from "lucide-react";
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Your AI Productivity Toolkit</h2>
          <p className="text-muted-foreground">
            Curated tools matched to your workflow — handpicked to boost focus, output, and clarity at every step of your day.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Zap className="w-4 h-4 mr-1" />
          {plan.aiTools.length} Tools
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {plan.aiTools.map((tool, index) => (
          <Card key={index} className="p-6 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              {/* Tool header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-primary/20 p-2">
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
                    <Zap className="w-5 h-5 text-primary hidden" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{tool.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Recommended
                </Badge>
              </div>

              {/* Video Demo */}
              <div className="relative">
                <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                    <div className="text-center">
                      <PlayCircle className="w-12 h-12 text-teal-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">{tool.name} Demo</p>
                      <p className="text-xs text-gray-500">Click to watch</p>
                    </div>
                  </div>
                </AspectRatio>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </p>

              {/* Associated use case */}
              <div className="bg-teal-50 rounded-lg p-3">
                <p className="text-sm text-teal-700 font-medium">
                  Perfect for: {index === 0 && "Deep work and writing tasks"}
                  {index === 1 && "Communication and collaboration"}
                  {index === 2 && "Planning and organization"}
                  {index % 3 === 0 && index > 0 && "Data analysis and insights"}
                  {index % 3 === 1 && index > 1 && "Creative work and ideation"}
                  {index % 3 === 2 && index > 2 && "Research and learning"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button 
                  size="sm" 
                  className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700"
                  onClick={() => window.open('https://quillbot.com', '_blank')}
                >
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

      {/* Toolkit summary */}
      <Card className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <div className="text-center">
          <h4 className="font-semibold text-foreground mb-2">Your Complete AI Productivity Toolkit</h4>
          <p className="text-muted-foreground text-sm mb-4">
            These tools work together to address your main challenge: {responses.productivityStruggle.toLowerCase()}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="rounded-xl border-teal-300 text-teal-700 hover:bg-teal-50">
              Download Tool List
            </Button>
            <Button className="rounded-xl bg-teal-600 hover:bg-teal-700">
              Get All Tools (Save 40%)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};