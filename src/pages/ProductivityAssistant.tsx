import { useState, useEffect } from "react";
import { IntroScreen } from "@/components/IntroScreen";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Dashboard } from "@/components/Dashboard";
import { AuthFlow } from "@/components/AuthFlow";
import { PaymentSuccess } from "@/components/PaymentSuccess";
import { CreateAccount } from "@/components/CreateAccount";
import { generateProductivityPlan } from "@/utils/productivityGenerator";
import { supabase } from "@/integrations/supabase/client";
import type { UserResponses, ProductivityPlan } from "@/types/productivity";
import type { User } from "@supabase/supabase-js";

type AppState = "intro" | "auth" | "onboarding" | "results" | "payment-success" | "create-account";

export const ProductivityAssistant = () => {
  const [currentState, setCurrentState] = useState<AppState>("intro");
  const [userResponses, setUserResponses] = useState<UserResponses | null>(null);
  const [productivityPlan, setProductivityPlan] = useState<ProductivityPlan | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // If user is already logged in, go straight to dashboard
      if (session?.user) {
        setCurrentState("results");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        // When user logs in, go straight to dashboard (skip onboarding for returning users)
        setCurrentState("results");
      } else if (event === 'SIGNED_OUT') {
        setCurrentState("intro");
        setUserResponses(null);
        setProductivityPlan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleAuth = () => {
    setCurrentState("auth");
  };

  const handleAuthSuccess = () => {
    // For returning users, go straight to dashboard
    setCurrentState("results");
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

  const handlePaymentSuccess = () => {
    setCurrentState("create-account");
  };

  const handleAccountCreated = () => {
    setCurrentState("onboarding");
  };

  const handleRestart = () => {
    setUserResponses(null);
    setProductivityPlan(null);
    setCurrentState("intro");
  };

  // Check for payment success on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session_id')) {
      setCurrentState("payment-success");
    }
  }, []);

  switch (currentState) {
    case "intro":
      return <IntroScreen onStart={handleStart} onAuth={handleAuth} />;
    
    case "auth":
      return <AuthFlow onAuthSuccess={handleAuthSuccess} onBack={handleBackToIntro} />;
    
    case "payment-success":
      return <PaymentSuccess onCreateAccount={handlePaymentSuccess} />;
    
    case "create-account":
      return <CreateAccount onAccountCreated={handleAccountCreated} />;
    
    case "onboarding":
      return (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onBack={handleBackToIntro}
        />
      );
    
    case "results":
      // For returning users, generate a sample plan if none exists
      if (!productivityPlan || !userResponses) {
        const sampleResponses: UserResponses = {
          productivityStruggle: "focus",
          goals: "efficiency", 
          currentTools: "digital",
          aiFamiliarity: "some",
          productiveTime: "morning"
        };
        const samplePlan = generateProductivityPlan(sampleResponses);
        setUserResponses(sampleResponses);
        setProductivityPlan(samplePlan);
        return (
          <Dashboard 
            plan={samplePlan}
            responses={sampleResponses}
            onRestart={handleRestart}
          />
        );
      }
      
      return (
        <Dashboard 
          plan={productivityPlan}
          responses={userResponses}
          onRestart={handleRestart}
        />
      );
    
    default:
      return <IntroScreen onStart={handleStart} onAuth={handleAuth} />;
  }
};