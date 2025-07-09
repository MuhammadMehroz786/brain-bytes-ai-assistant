import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, MessageSquare, Download, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface GPTPromptsSectionProps {
  plan: ProductivityPlan;
  responses: UserResponses;
}

export const GPTPromptsSection = ({ plan }: GPTPromptsSectionProps) => {
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

  const handleCopyPrompt = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(index);
    toast({
      title: "Copied!",
      description: "GPT prompt copied to clipboard",
    });
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const promptTitles = [
    "Weekly Review & Planning",
    "Deep Work Session Prep",
    "Meeting Follow-up Generator",
    "Creative Problem Solving",
    "Daily Reflection & Insights"
  ];

  const promptPreviews = [
    "Generates structured weekly reviews with accomplishments, challenges, and next week's priorities",
    "Creates focused session plans with clear objectives, time blocks, and success metrics",
    "Automatically formats meeting notes into actionable items and follow-up tasks",
    "Breaks down complex problems using systematic thinking frameworks",
    "Provides thoughtful end-of-day reflection with improvement suggestions"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Smart GPT Prompts</h2>
          <p className="text-muted-foreground">
            Precision-crafted prompts designed to help you write faster, think clearer, and execute smarter
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <MessageSquare className="w-4 h-4 mr-1" />
          {plan.gptPrompts.length} Prompts
        </Badge>
      </div>

      <div className="space-y-4">
        {plan.gptPrompts.map((prompt, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl flex items-center justify-center border border-accent/20">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {promptTitles[index] || `Prompt #${index + 1}`}
                    </h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Productivity Enhancement
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPrompt(prompt, index)}
                  className="rounded-xl"
                >
                  {copiedPrompt === index ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Preview */}
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-2">What it does:</p>
                <p className="text-sm text-foreground">
                  {promptPreviews[index] || "Optimizes your workflow with targeted AI assistance"}
                </p>
              </div>

              {/* Prompt content */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Prompt</span>
                </div>
                <div className="bg-white/50 rounded-lg p-3 font-mono text-sm text-foreground leading-relaxed max-h-32 overflow-y-auto">
                  {prompt}
                </div>
              </div>

              {/* Usage tip */}
              <div className="flex items-start gap-2 p-3 bg-success/5 rounded-lg border border-success/10">
                <div className="w-2 h-2 bg-success rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-success mb-1">Pro Tip:</p>
                  <p className="text-xs text-muted-foreground">
                    {index === 0 && "Use this every Friday to plan your upcoming week effectively"}
                    {index === 1 && "Run this before starting any important task or project"}
                    {index === 2 && "Apply within 24 hours of any meeting for best results"}
                    {index === 3 && "Break down challenges into smaller, manageable steps"}
                    {index % 4 === 0 && index > 0 && "Use at the end of each workday for continuous improvement"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Download section */}
      <Card className="p-6 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Download className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Complete Prompt Pack</h4>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Get all prompts in a beautifully formatted PDF with usage instructions and examples
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="rounded-xl">
              <Copy className="w-4 h-4 mr-2" />
              Copy All Prompts
            </Button>
            <Button className="rounded-xl">
              <Download className="w-4 h-4 mr-2" />
              Download Full Pack
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};