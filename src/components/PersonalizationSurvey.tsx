import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonalizationSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
}

export interface UserPreferences {
  priority: string;
  experienceLevel: string;
  toolPreference: string;
}

export const PersonalizationSurvey = ({ isOpen, onClose, onComplete }: PersonalizationSurveyProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    priority: "",
    experienceLevel: "",
    toolPreference: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save preferences to Supabase
        const { error } = await supabase
          .from('ai_tool_preferences')
          .upsert({
            user_id: user.id,
            priority: preferences.priority,
            experience_level: preferences.experienceLevel,
            tool_preference: preferences.toolPreference
          });

        if (error) throw error;
      }

      onComplete(preferences);
      onClose();
      toast({
        title: "Preferences Saved",
        description: "Your AI toolkit has been personalized based on your answers.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const updatePreference = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return preferences.priority !== "";
      case 2: return preferences.experienceLevel !== "";
      case 3: return preferences.toolPreference !== "";
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Personalize My Toolkit
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            Answer 3 quick questions to get AI tools tailored to your needs
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Question 1 */}
          {currentStep === 1 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">What's your current priority?</h3>
              <RadioGroup
                value={preferences.priority}
                onValueChange={(value) => updatePreference('priority', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="focus" id="focus" />
                  <Label htmlFor="focus">Focus & Deep Work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="automation" id="automation" />
                  <Label htmlFor="automation">Automate Repetitive Tasks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="writing" id="writing" />
                  <Label htmlFor="writing">Write Faster & Better</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="collaboration" id="collaboration" />
                  <Label htmlFor="collaboration">Manage Projects & Collaboration</Label>
                </div>
              </RadioGroup>
            </Card>
          )}

          {/* Question 2 */}
          {currentStep === 2 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">How experienced are you with AI tools?</h3>
              <RadioGroup
                value={preferences.experienceLevel}
                onValueChange={(value) => updatePreference('experienceLevel', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Advanced</Label>
                </div>
              </RadioGroup>
            </Card>
          )}

          {/* Question 3 */}
          {currentStep === 3 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">What do you prefer?</h3>
              <RadioGroup
                value={preferences.toolPreference}
                onValueChange={(value) => updatePreference('toolPreference', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple">Simple tools with easy setup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced-tools" />
                  <Label htmlFor="advanced-tools">Advanced tools with more features</Label>
                </div>
              </RadioGroup>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              className="rounded-xl"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepComplete() || isLoading}
              className="rounded-xl bg-teal-600 hover:bg-teal-700"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentStep === 3 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};