import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, Target, BookOpen, RotateCcw, CheckCircle2, ArrowRight, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizAnswers {
  struggle: string;
  goal: string;
  experience: string;
}

export const WaitlistLanding = () => {
  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
    struggle: "",
    goal: "",
    experience: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      // Here you would normally submit to your backend/database
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast({
        title: "You're on the waitlist! 🎉",
        description: "We'll notify you when Brain Bytes AI launches.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleQuizBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnswer = (key: keyof QuizAnswers, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [key]: value }));
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return quizAnswers.struggle !== "";
      case 2: return quizAnswers.goal !== "";
      case 3: return quizAnswers.experience !== "";
      default: return false;
    }
  };

  const renderQuizStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">What's your biggest productivity struggle?</h3>
            <RadioGroup value={quizAnswers.struggle} onValueChange={(value) => updateAnswer("struggle", value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overwhelmed" id="overwhelmed" />
                <Label htmlFor="overwhelmed">Too many tools, not sure what to use</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="focus" id="focus" />
                <Label htmlFor="focus">Staying focused throughout the day</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organization" id="organization" />
                <Label htmlFor="organization">Getting organized and staying that way</Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">What's your main goal?</h3>
            <RadioGroup value={quizAnswers.goal} onValueChange={(value) => updateAnswer("goal", value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efficiency" id="efficiency" />
                <Label htmlFor="efficiency">Work smarter, not harder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balance" id="balance" />
                <Label htmlFor="balance">Better work-life balance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="growth" id="growth" />
                <Label htmlFor="growth">Level up my skills</Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">How comfortable are you with AI tools?</h3>
            <RadioGroup value={quizAnswers.experience} onValueChange={(value) => updateAnswer("experience", value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">Complete beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="some" id="some" />
                <Label htmlFor="some">I've tried a few</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="experienced" id="experienced" />
                <Label htmlFor="experienced">Pretty experienced</Label>
              </div>
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">Brain Bytes</span>
            </div>
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Demo
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Log In
              </Button>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-6" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              You're on the waitlist! 🎉
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We'll email you when Brain Bytes AI launches. Thanks for your interest!
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Take the quiz anyway
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">Brain Bytes</span>
          </div>
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Demo
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Log In
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground">
                Overwhelmed by AI?
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                New tools drop every day. Most people don't know where to start.
                <br />
                <br />
                Brain Bytes is your AI starter kit — built to cut through the noise and give you only what works, based on your goals.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                >
                  {isLoading ? "Joining..." : "→ Join the Waitlist — Be First to Access Brain Bytes AI"}
                </Button>
              </div>
            </form>

            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>🔐</span>
                <span>One-time $29 – No subscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚀</span>
                <span>100% Personalized</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🧠</span>
                <span>Built by productivity nerds for productivity nerds</span>
              </div>
            </div>
          </div>

          {/* Right Column - Quiz */}
          <div className="lg:pl-8">
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">Get Your AI Plan Preview</h2>
                    <p className="text-muted-foreground">Answer 3 quick questions</p>
                    <div className="flex justify-center gap-2 mt-4">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-2 w-8 rounded-full transition-colors ${
                            step <= currentStep ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {renderQuizStep()}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handleQuizBack}
                      disabled={currentStep === 1}
                      size="sm"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleQuizNext}
                      disabled={!isStepComplete() || currentStep === 3}
                      size="sm"
                    >
                      {currentStep === 3 ? "Get My Plan" : "Next"}
                    </Button>
                  </div>

                  {currentStep === 3 && isStepComplete() && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground">Your Plan Is Loading...</div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="h-8 bg-primary/20 rounded animate-pulse" />
                          <div className="h-8 bg-primary/20 rounded animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="h-8 bg-primary/20 rounded animate-pulse" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      "This literally saved me hours of research" – Sarah K.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Plan Preview */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-foreground">Here's what you'll get in your plan:</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">🎯 Tool Picks</h3>
                <p className="text-muted-foreground">Curated AI tools that actually solve your specific problems</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">🎓 How-To Guides</h3>
                <p className="text-muted-foreground">Step-by-step tutorials to get you up and running fast</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">🔄 Daily Workflow Blueprint</h3>
                <p className="text-muted-foreground">A personalized system that fits your daily routine</p>
              </div>
            </div>

            <div className="mt-12">
              <div className="bg-background border border-border/50 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Play className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">60-Second Demo</span>
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">See what a finished plan looks like in action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};