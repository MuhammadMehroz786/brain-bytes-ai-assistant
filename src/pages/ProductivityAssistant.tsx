import { useState } from "react";
import { IntroScreen } from "@/components/IntroScreen";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Dashboard } from "@/components/Dashboard";
import { generateProductivityPlan } from "@/utils/productivityGenerator";
import type { UserResponses, ProductivityPlan } from "@/types/productivity";

type AppState = "intro" | "onboarding" | "results";

export const ProductivityAssistant = () => {
  const [currentState, setCurrentState] = useState<AppState>("intro");
  const [userResponses, setUserResponses] = useState<UserResponses | null>(null);
  const [productivityPlan, setProductivityPlan] = useState<ProductivityPlan | null>(null);

  const handleStart = () => {
    setCurrentState("onboarding");
  };

  const handleOnboardingComplete = (responses: UserResponses) => {
    setUserResponses(responses);
    const plan = generateProductivityPlan(responses);
    setProductivityPlan(plan);
    setCurrentState("results");
  };

  const handleBackToIntro = () => {
    setCurrentState("intro");
  };

  const handleRestart = () => {
    setUserResponses(null);
    setProductivityPlan(null);
    setCurrentState("intro");
  };

  switch (currentState) {
    case "intro":
      return <IntroScreen onStart={handleStart} />;
    
    case "onboarding":
      return (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onBack={handleBackToIntro}
        />
      );
    
    case "results":
      return productivityPlan && userResponses ? (
        <Dashboard 
          plan={productivityPlan}
          responses={userResponses}
          onRestart={handleRestart}
        />
      ) : null;
    
    default:
      return <IntroScreen onStart={handleStart} />;
  }
};