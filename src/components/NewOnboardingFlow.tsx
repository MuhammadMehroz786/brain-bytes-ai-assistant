import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingResponses } from "@/types/productivity";

interface NewOnboardingFlowProps {
  onComplete: (responses: OnboardingResponses) => void;
  onBack: () => void;
}

const questions = [
  {
    id: "aiGoal",
    title: "What are you mainly trying to achieve with AI?",
    type: "radio" as const,
    options: [
      { value: "content", label: "Create content faster" },
      { value: "automation", label: "Automate repetitive tasks" },
      { value: "learning", label: "Learn new tools and skills" },
      { value: "organization", label: "Stay organized and focused" },
      { value: "business", label: "Grow a business" },
    ]
  },
  {
    id: "workflowType",
    title: "Which best describes your daily workflow?",
    type: "radio" as const,
    options: [
      { value: "solo", label: "I work solo and manage my own schedule" },
      { value: "small-team", label: "I work with a small team (2–5 people)" },
      { value: "leader", label: "I lead or coordinate across multiple people" },
      { value: "student", label: "I'm a student or freelancer" },
      { value: "other", label: "Something else" },
    ]
  },
  {
    id: "biggestChallenge",
    title: "What's your biggest current challenge?",
    type: "radio" as const,
    options: [
      { value: "distractions", label: "Too many distractions or open tabs" },
      { value: "trust", label: "Don't know which tools to trust" },
      { value: "manual-tasks", label: "Wasting time on manual tasks" },
      { value: "overwhelm", label: "Struggling to stay on top of emails and meetings" },
      { value: "structure", label: "Lack of structure or planning" },
    ]
  },
  {
    id: "learningPreference",
    title: "How do you prefer to learn new tools?",
    type: "radio" as const,
    options: [
      { value: "videos", label: "Short demo videos" },
      { value: "guides", label: "Step-by-step guides" },
      { value: "self-guided", label: "I just want the tools – I'll figure it out" },
      { value: "unsure", label: "I don't know yet" },
    ]
  },
  {
    id: "focusTime",
    title: "When do you usually do focused work?",
    subtitle: "This is used for syncing focus sessions into your calendar",
    type: "radio" as const,
    options: [
      { value: "morning", label: "Morning" },
      { value: "midday", label: "Midday" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" },
      { value: "varies", label: "It varies" },
    ]
  },
  {
    id: "workDescription",
    title: "What do you do for work?",
    subtitle: "Optional - helps us personalize your experience",
    type: "text" as const,
    placeholder: "e.g., Marketing manager at Shopify, student, etc.",
  }
];

export const NewOnboardingFlow = ({ onComplete, onBack }: NewOnboardingFlowProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Partial<OnboardingResponses>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id as keyof OnboardingResponses;
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Save responses to database
      const { error } = await supabase
        .from('user_onboarding_responses')
        .upsert({
          user_id: user.id,
          ai_goal: responses.aiGoal!,
          workflow_type: responses.workflowType!,
          biggest_challenge: responses.biggestChallenge!,
          learning_preference: responses.learningPreference!,
          focus_time: responses.focusTime!,
          work_description: responses.workDescription || null,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Onboarding Complete!",
        description: "Your preferences have been saved. Generating your personalized toolkit...",
      });

      onComplete(responses as OnboardingResponses);
    } catch (error) {
      console.error('Error saving onboarding responses:', error);
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
  const currentAnswer = responses[currentQuestionData.id as keyof OnboardingResponses];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = currentQuestionData.type === 'text' ? true : !!currentAnswer;

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
            <h2 className="text-3xl font-bold text-foreground mb-3 leading-tight">
              {currentQuestionData.title}
            </h2>
            {currentQuestionData.subtitle && (
              <p className="text-muted-foreground mb-6">
                {currentQuestionData.subtitle}
              </p>
            )}
            
            {currentQuestionData.type === 'radio' ? (
              <RadioGroup 
                value={currentAnswer || ""} 
                onValueChange={handleAnswer}
                className="space-y-4"
              >
                {currentQuestionData.options?.map((option) => (
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
            ) : (
              <Input
                value={currentAnswer || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestionData.placeholder}
                className="text-base"
              />
            )}
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
              disabled={!canProceed || isSubmitting}
              className="rounded-xl px-8 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : isLastQuestion ? "Complete Setup" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};