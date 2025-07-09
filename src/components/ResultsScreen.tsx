import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, CheckCircle, Clock, Sparkles, Target, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ProductivityPlan, UserResponses } from "@/types/productivity";

interface ResultsScreenProps {
  plan: ProductivityPlan;
  responses: UserResponses;
  onRestart: () => void;
}

export const ResultsScreen = ({ plan, responses, onRestart }: ResultsScreenProps) => {
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

  const handleDownloadPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;
      
      const element = document.getElementById("productivity-plan");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("ai-productivity-plan.pdf");
      toast({
        title: "Downloaded!",
        description: "Your productivity plan has been saved as PDF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCopyAllText = () => {
    const textContent = `
AI PRODUCTIVITY PLAN

${plan.summary}

DAILY SCHEDULE:
${plan.timeBlocks.map(block => `${block.time} - ${block.activity} (${block.duration})\n${block.description}`).join('\n\n')}

RECOMMENDED AI TOOLS:
${plan.aiTools.map(tool => `• ${tool.name} - ${tool.description} (${tool.category})`).join('\n')}

GPT PROMPTS:
${plan.gptPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n\n')}
    `;
    
    navigator.clipboard.writeText(textContent);
    toast({
      title: "Copied!",
      description: "Complete plan copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-blue to-pastel-green p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-2xl mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Your AI Productivity Plan</h1>
          <p className="text-lg text-muted-foreground mb-6">Personalized for maximum efficiency and focus</p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button onClick={handleDownloadPDF} className="rounded-xl">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleCopyAllText} className="rounded-xl">
              <Copy className="w-4 h-4 mr-2" />
              Copy All Text
            </Button>
            <Button variant="outline" onClick={onRestart} className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        <div id="productivity-plan" className="bg-white rounded-3xl p-8 shadow-2xl">
          <Card className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Your Personalized Summary
            </h2>
            <p className="text-foreground leading-relaxed">{plan.summary}</p>
          </Card>

          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted p-1">
              <TabsTrigger value="schedule" className="rounded-xl">Daily Schedule</TabsTrigger>
              <TabsTrigger value="tools" className="rounded-xl">AI Tools</TabsTrigger>
              <TabsTrigger value="prompts" className="rounded-xl">GPT Prompts</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4 mt-6">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-primary" />
                Time-Blocked Daily Plan
              </h3>
              <div className="space-y-4">
                {plan.timeBlocks.map((block, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-primary">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{block.activity}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{block.time}</Badge>
                        <Badge variant="secondary">{block.duration}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{block.description}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4 mt-6">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-primary" />
                Recommended AI Tools
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {plan.aiTools.map((tool, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">{tool.name}</h4>
                      <Badge>{tool.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{tool.description}</p>
                    {tool.affiliateLink && (
                      <Button variant="outline" size="sm" className="w-full rounded-xl">
                        Learn More
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="space-y-4 mt-6">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2 text-primary" />
                Your Custom GPT Prompts
              </h3>
              <div className="space-y-4">
                {plan.gptPrompts.map((prompt, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">Prompt #{index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPrompt(prompt, index)}
                        className="rounded-xl"
                      >
                        {copiedPrompt === index ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-foreground leading-relaxed bg-muted/50 p-4 rounded-xl">
                      {prompt}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};