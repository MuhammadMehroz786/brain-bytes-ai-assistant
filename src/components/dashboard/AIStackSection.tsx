import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Zap, Play, ExternalLink, Star, PlayCircle, Settings } from "lucide-react";
import type { ProductivityPlan, UserResponses, UserPreferences } from "@/types/productivity";
import { PersonalizationSurvey } from "@/components/PersonalizationSurvey";
import { SystemUpgradeWaitlist } from "@/components/SystemUpgradeWaitlist";
import { supabase } from "@/integrations/supabase/client";
interface AIStackSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}
export const AIStackSection = ({
  plan,
  responses
}: AIStackSectionProps) => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [personalizedTools, setPersonalizedTools] = useState(plan.aiTools);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
  }, []);
  const loadUserPreferences = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data,
          error
        } = await supabase.from('ai_tool_preferences').select('*').eq('user_id', user.id).maybeSingle();
        if (data && !error) {
          const preferences = {
            priority: data.priority,
            experienceLevel: data.experience_level,
            toolPreference: data.tool_preference
          };
          setUserPreferences(preferences);
          generatePersonalizedTools(preferences);
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };
  const generatePersonalizedTools = (preferences: UserPreferences) => {
    const toolDatabase = getToolDatabase();
    let recommendedTools = [];

    // Filter tools based on priority
    const priorityTools = toolDatabase.filter(tool => tool.categories.includes(preferences.priority));

    // Filter based on experience level
    const experienceFilteredTools = priorityTools.filter(tool => {
      if (preferences.experienceLevel === 'beginner') {
        return tool.complexity === 'easy';
      } else if (preferences.experienceLevel === 'intermediate') {
        return ['easy', 'medium'].includes(tool.complexity);
      } else {
        return true; // advanced users can use any tool
      }
    });

    // Filter based on tool preference
    const finalTools = experienceFilteredTools.filter(tool => {
      if (preferences.toolPreference === 'simple') {
        return tool.setupComplexity === 'simple';
      } else {
        return true; // advanced preference can use any setup complexity
      }
    });

    // Take top 6 tools and fallback to default if not enough
    recommendedTools = finalTools.slice(0, 6);
    if (recommendedTools.length < 3) {
      // Fallback to some default tools if filtering results in too few tools
      const fallbackTools = toolDatabase.slice(0, 6 - recommendedTools.length);
      recommendedTools = [...recommendedTools, ...fallbackTools];
    }
    setPersonalizedTools(recommendedTools);
  };
  const handlePersonalizationComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    generatePersonalizedTools(preferences);
  };
  const getToolDatabase = () => [
  // Focus & Deep Work tools
  {
    name: "Motion",
    description: "AI-powered calendar that automatically schedules your tasks and blocks focus time.",
    category: "Productivity",
    categories: ["focus"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://motion.com"
  }, {
    name: "Notion AI",
    description: "Intelligent writing assistant built into your favorite workspace.",
    category: "Writing",
    categories: ["focus", "writing"],
    complexity: "medium",
    setupComplexity: "simple",
    url: "https://notion.so"
  }, {
    name: "ChatGPT Plus",
    description: "Advanced AI assistant for research, writing, and problem-solving.",
    category: "AI Assistant",
    categories: ["focus", "writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://openai.com"
  },
  // Automation tools
  {
    name: "Bardeen",
    description: "No-code automation platform that connects your favorite apps.",
    category: "Automation",
    categories: ["automation"],
    complexity: "medium",
    setupComplexity: "advanced",
    url: "https://bardeen.ai"
  }, {
    name: "Zapier",
    description: "Connect 5000+ apps to automate repetitive tasks without coding.",
    category: "Automation",
    categories: ["automation"],
    complexity: "medium",
    setupComplexity: "advanced",
    url: "https://zapier.com"
  }, {
    name: "Superhuman",
    description: "The fastest email experience ever made, with AI-powered features.",
    category: "Email",
    categories: ["automation", "collaboration"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://superhuman.com"
  },
  // Writing tools
  {
    name: "Jasper",
    description: "AI copywriter that creates high-quality content for marketing and business.",
    category: "Writing",
    categories: ["writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://jasper.ai"
  }, {
    name: "Grammarly",
    description: "AI writing assistant that helps you write clearly and confidently.",
    category: "Writing",
    categories: ["writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://grammarly.com"
  }, {
    name: "Quillbot",
    description: "AI-powered paraphrasing tool and writing assistant.",
    category: "Writing",
    categories: ["writing"],
    complexity: "easy",
    setupComplexity: "simple",
    url: "https://quillbot.com"
  },
  // Project Management tools
  {
    name: "Linear",
    description: "Issue tracking and project management tool built for software teams.",
    category: "Project Management",
    categories: ["collaboration"],
    complexity: "medium",
    setupComplexity: "simple",
    url: "https://linear.app"
  }, {
    name: "ClickUp",
    description: "All-in-one productivity platform with AI-powered project management.",
    category: "Project Management",
    categories: ["collaboration"],
    complexity: "medium",
    setupComplexity: "advanced",
    url: "https://clickup.com"
  }, {
    name: "Notion",
    description: "Connected workspace for notes, docs, projects, and knowledge management.",
    category: "Productivity",
    categories: ["collaboration", "focus"],
    complexity: "medium",
    setupComplexity: "simple",
    url: "https://notion.so"
  }];
  const getUseCase = (tool: any, index: number) => {
    if (!userPreferences) {
      // Default use cases
      if (index === 0) return "Deep work and writing tasks";
      if (index === 1) return "Communication and collaboration";
      if (index === 2) return "Planning and organization";
      if (index % 3 === 0) return "Data analysis and insights";
      if (index % 3 === 1) return "Creative work and ideation";
      return "Research and learning";
    }

    // Personalized use cases based on preferences
    switch (userPreferences.priority) {
      case 'focus':
        return "Enhanced focus and deep work sessions";
      case 'automation':
        return "Streamlined workflows and task automation";
      case 'writing':
        return "Improved writing quality and speed";
      case 'collaboration':
        return "Better team coordination and project management";
      default:
        return "Productivity optimization";
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Your AI Productivity Toolkit</h2>
          <p className="text-muted-foreground">
            {userPreferences ? `Personalized tools for ${userPreferences.priority} and ${userPreferences.experienceLevel} users` : "Curated tools matched to your workflow — handpicked to boost focus, output, and clarity at every step of your day."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowSurvey(true)} className="rounded-xl border-teal-300 text-teal-700 hover:bg-teal-50">
            <Settings className="w-4 h-4 mr-2" />
            Personalize My Toolkit
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            <Zap className="w-4 h-4 mr-1" />
            {personalizedTools.length} Tools
          </Badge>
        </div>
      </div>

      <PersonalizationSurvey isOpen={showSurvey} onClose={() => setShowSurvey(false)} onComplete={handlePersonalizationComplete} />

      <div className="grid lg:grid-cols-2 gap-6">
        {personalizedTools.map((tool, index) => <Card key={index} className="p-6 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              {/* Tool header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-primary/20 p-2">
                    <img src={`https://logo.clearbit.com/${tool.name.toLowerCase().replace(/\s+/g, '')}.com`} alt={`${tool.name} logo`} className="w-full h-full object-contain" onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }} />
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
                  Perfect for: {getUseCase(tool, index)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button size="sm" className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700" onClick={() => window.open(tool.url || tool.affiliateLink || '#', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Try {tool.name}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>)}
      </div>

      {/* Toolkit summary */}
      

      {/* System Upgrade Waitlist */}
      <SystemUpgradeWaitlist />
    </div>;
};