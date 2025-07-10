import { useState, useEffect } from "react";
import { IntroScreen } from "@/components/IntroScreen";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Dashboard } from "@/components/Dashboard";
import { AuthFlow } from "@/components/AuthFlow";
import { generateProductivityPlan } from "@/utils/productivityGenerator";
import { supabase } from "@/integrations/supabase/client";
import type { UserResponses, ProductivityPlan } from "@/types/productivity";
import type { User } from "@supabase/supabase-js";

type AppState = "intro" | "auth" | "onboarding" | "results";

export const ProductivityAssistant = () => {
  const [currentState, setCurrentState] = useState<AppState>("intro");
  const [userResponses, setUserResponses] = useState<UserResponses | null>(null);
  const [productivityPlan, setProductivityPlan] = useState<ProductivityPlan | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setCurrentState("intro");
        setUserResponses(null);
        setProductivityPlan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = () => {
    setCurrentState("onboarding");
  };

  const handleAuth = () => {
    setCurrentState("auth");
  };

  const handleAuthSuccess = () => {
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
      return <IntroScreen onStart={handleStart} onAuth={handleAuth} />;
    
    case "auth":
      return <AuthFlow onAuthSuccess={handleAuthSuccess} onBack={handleBackToIntro} />;
    
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
      return <IntroScreen onStart={handleStart} onAuth={handleAuth} />;
  }
};