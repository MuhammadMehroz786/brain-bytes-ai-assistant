import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EducationTool, EducationCard } from "./types";

interface LearningFlashcardProps {
  tool: EducationTool;
  onBack?: () => void;
}

type FlowStep = 'front' | 'skill-level' | 'exercise' | 'practice' | 'complete';

const LearningFlashcard = ({ tool, onBack }: LearningFlashcardProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('front');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'advanced' | null>(null);
  
  const firstCard = tool.cards[0];

  const getToolDescription = () => {
    switch (tool.id) {
      case 'notion-ai':
        return 'Transform messy ideas into structured, polished pages with AI assistance. Perfect for docs, wikis, and knowledge management.';
      case 'chatgpt':
        return 'Have intelligent conversations with AI to solve problems, brainstorm ideas, and get instant help with any task.';
      case 'task-automation':
        return 'Set up smart workflows that handle repetitive tasks automatically, saving hours of manual work every week.';
      default:
        return 'Learn to use this powerful AI tool effectively in your daily workflow.';
    }
  };

  const renderFront = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 inline-block">
          <tool.icon className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <Badge variant="secondary" className="text-sm">
            {tool.category}
          </Badge>
        </div>
      </div>
      
      <p className="text-lg text-muted-foreground max-w-2xl">
        {getToolDescription()}
      </p>
      
      <Button 
        size="lg" 
        onClick={() => setCurrentStep('skill-level')}
        className="w-full max-w-xs mx-auto px-8 py-6 text-base md:text-lg rounded-xl ring-1 ring-primary/20 hover:ring-primary/30 shadow-md hover:shadow-lg transition-shadow"
      >
        Learn This Tool
      </Button>
    </div>
  );

  const renderSkillLevel = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">What's your experience level?</h2>
        <p className="text-muted-foreground">
          This helps us customize the learning path for you
        </p>
      </div>
      
      <div className="flex gap-4 justify-center">
        <Button
          variant={skillLevel === 'beginner' ? 'default' : 'outline'}
          size="lg"
          onClick={() => setSkillLevel('beginner')}
          className="px-8 py-6 text-lg flex-col h-auto"
        >
          <div className="font-semibold">Beginner</div>
          <div className="text-sm opacity-80">New to {tool.name}</div>
        </Button>
        <Button
          variant={skillLevel === 'advanced' ? 'default' : 'outline'}
          size="lg"
          onClick={() => setSkillLevel('advanced')}
          className="px-8 py-6 text-lg flex-col h-auto"
        >
          <div className="font-semibold">Advanced</div>
          <div className="text-sm opacity-80">Already familiar</div>
        </Button>
      </div>
      
      {skillLevel && (
        <Button onClick={() => setCurrentStep('exercise')} size="lg">
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const renderExercise = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">{firstCard?.title}</h2>
        <Badge variant="secondary">~3 min exercise</Badge>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Steps:</h3>
          <ol className="space-y-2">
            {firstCard?.quickSteps.slice(0,3).map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        
      </div>
      
      <div className="text-center space-y-4">
        <Button onClick={() => setCurrentStep('practice')} size="lg">
          Try It Now
        </Button>
        <div className="text-sm text-muted-foreground">
          This should take about 3 minutes
        </div>
      </div>
    </div>
  );

  const renderPractice = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Great! Now put it into practice</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Open {tool.name} and try the exercise. Come back when you're done to mark your progress.
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          size="lg" 
          onClick={() => setCurrentStep('complete')}
          className="px-8"
        >
          I completed the exercise
        </Button>
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep('exercise')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go back to instructions
          </Button>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">Awesome work!</h2>
        <p className="text-muted-foreground">
          You've completed your first {tool.name} exercise. You're building real AI skills!
        </p>
      </div>
      
      <div className="space-y-4">
        <Button size="lg" onClick={() => setCurrentStep('front')}>
          Continue Learning
        </Button>
        {onBack && (
          <div>
            <Button variant="ghost" onClick={onBack}>
              Choose Another Tool
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const getCurrentContent = () => {
    switch (currentStep) {
      case 'front':
        return renderFront();
      case 'skill-level':
        return renderSkillLevel();
      case 'exercise':
        return renderExercise();
      case 'practice':
        return renderPractice();
      case 'complete':
        return renderComplete();
      default:
        return renderFront();
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto rounded-3xl border bg-background/80 backdrop-blur shadow-xl">
      <CardContent className="p-8 md:p-12 min-h-[70vh] md:min-h-[75vh] flex items-center justify-center">
        {getCurrentContent()}
      </CardContent>
    </Card>
  );
};

export default LearningFlashcard;