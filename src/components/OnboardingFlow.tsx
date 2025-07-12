import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { UserResponses } from "@/types/productivity";

interface OnboardingFlowProps {
  onComplete: (responses: UserResponses) => void;
  onBack: () => void;
}

const questions = [
  {
    id: "productivityStruggle",
    title: "What is your biggest productivity struggle right now?",
    options: [
      { value: "focus", label: "Staying focused and avoiding distractions" },
      { value: "overwhelm", label: "Feeling overwhelmed by too many tasks" },
      { value: "procrastination", label: "Procrastination and getting started" },
      { value: "time-management", label: "Managing time effectively" },
      { value: "motivation", label: "Maintaining motivation throughout the day" },
    ]
  },
  {
    id: "goals",
    title: "What do you want to achieve with your AI assistant?",
    options: [
      { value: "efficiency", label: "Get more done in less time" },
      { value: "organization", label: "Better task organization and planning" },
      { value: "focus", label: "Improve focus and concentration" },
      { value: "balance", label: "Better work-life balance" },
      { value: "stress", label: "Reduce stress and overwhelm" },
    ]
  },
  {
    id: "currentTools",
    title: "What tools do you currently use to stay organized or focused?",
    options: [
      { value: "none", label: "I don't use any specific tools" },
      { value: "basic", label: "Basic tools (notebooks, simple apps)" },
      { value: "digital", label: "Digital tools (Notion, Todoist, Trello)" },
      { value: "advanced", label: "Advanced systems (GTD, custom workflows)" },
      { value: "multiple", label: "Multiple tools but struggle to stick with them" },
    ]
  },
  {
    id: "aiFamiliarity",
    title: "How familiar are you with using AI in your daily work?",
    options: [
      { value: "beginner", label: "Complete beginner - new to AI tools" },
      { value: "some", label: "I've tried ChatGPT or similar a few times" },
      { value: "regular", label: "I use AI tools regularly for some tasks" },
      { value: "advanced", label: "I'm comfortable with various AI tools" },
      { value: "expert", label: "I integrate AI into most of my workflow" },
    ]
  },
  {
    id: "productiveTime",
    title: "When during the day are you most productive?",
    options: [
      { value: "early-morning", label: "Early morning (6-9 AM)" },
      { value: "morning", label: "Late morning (9 AM-12 PM)" },
      { value: "afternoon", label: "Afternoon (12-5 PM)" },
      { value: "evening", label: "Evening (5-9 PM)" },
      { value: "varies", label: "It varies day to day" },
    ]
  }
];

export const OnboardingFlow = ({ onComplete, onBack }: OnboardingFlowProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<UserResponses>>({});

  const handleAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id as keyof UserResponses;
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(responses as UserResponses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = responses[currentQuestionData.id as keyof UserResponses];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-light via-primary-light to-success-light flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-muted rounded-full" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-6 leading-tight">
              {currentQuestionData.title}
            </h2>
            
            <RadioGroup 
              value={currentAnswer || ""} 
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="border-2 border-border data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor={option.value}
                    className="text-base leading-relaxed cursor-pointer hover:text-primary transition-colors"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="rounded-xl px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="rounded-xl px-8 bg-primary hover:bg-primary/90"
            >
              {currentQuestion === questions.length - 1 ? "Generate Plan" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};