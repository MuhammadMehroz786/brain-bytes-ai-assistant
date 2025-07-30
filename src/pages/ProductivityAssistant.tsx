import { useState, useEffect } from "react";
import { IntroScreen } from "@/components/IntroScreen";
import { NewOnboardingFlow } from "@/components/NewOnboardingFlow";
import { Dashboard } from "@/components/Dashboard";
import { AuthFlow } from "@/components/AuthFlow";
import { PaymentSuccess } from "@/components/PaymentSuccess";
import { CreateAccount } from "@/components/CreateAccount";
import { FeedbackModal } from "@/components/FeedbackModal";
import { generateProductivityPlan } from "@/utils/productivityGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import type { UserResponses, ProductivityPlan, OnboardingResponses } from "@/types/productivity";
import type { User } from "@supabase/supabase-js";

type AppState = "intro" | "auth" | "onboarding" | "results" | "payment-success" | "create-account";

export const ProductivityAssistant = () => {
  const [currentState, setCurrentState] = useState<AppState>("intro");
  const [userResponses, setUserResponses] = useState<UserResponses | null>(null);
  const [onboardingResponses, setOnboardingResponses] = useState<OnboardingResponses | null>(null);
  const [productivityPlan, setProductivityPlan] = useState<ProductivityPlan | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { showFeedbackModal, closeFeedbackModal } = useFeedbackModal();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // If user is already logged in, load their onboarding responses and go to dashboard
      if (session?.user) {
        loadOnboardingResponses(session.user.id);
        setCurrentState("results");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        // When user logs in, load their responses and go to dashboard
        loadOnboardingResponses(session.user.id);
        setCurrentState("results");
      } else if (event === 'SIGNED_OUT') {
        setCurrentState("intro");
        setUserResponses(null);
        setOnboardingResponses(null);
        setProductivityPlan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadOnboardingResponses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_onboarding_responses')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data && !error) {
        const responses: OnboardingResponses = {
          aiGoal: data.ai_goal,
          workflowType: data.workflow_type,
          biggestChallenge: data.biggest_challenge,
          learningPreference: data.learning_preference,
          focusTime: data.focus_time,
          workDescription: data.work_description || undefined,
        };
        setOnboardingResponses(responses);

        // Create legacy responses for compatibility
        const legacyResponses: UserResponses = {
          productivityStruggle: data.biggest_challenge,
          goals: data.ai_goal,
          currentTools: "digital",
          aiFamiliarity: "some",
          productiveTime: data.focus_time
        };
        setUserResponses(legacyResponses);
        const plan = generateProductivityPlan(legacyResponses);
        setProductivityPlan(plan);
      }
    } catch (error) {
      console.error('Error loading onboarding responses:', error);
    }
  };

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

  const handleOnboardingComplete = (responses: OnboardingResponses) => {
    setOnboardingResponses(responses);
    // Generate a basic plan for compatibility with existing dashboard
    const legacyResponses: UserResponses = {
      productivityStruggle: responses.biggestChallenge,
      goals: responses.aiGoal,
      currentTools: "digital",
      aiFamiliarity: "some",
      productiveTime: responses.focusTime
    };
    setUserResponses(legacyResponses);
    const plan = generateProductivityPlan(legacyResponses);
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
    setOnboardingResponses(null);
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
        <NewOnboardingFlow 
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
        <>
          <Dashboard 
            plan={productivityPlan}
            responses={userResponses}
            onRestart={handleRestart}
            onboardingResponses={onboardingResponses}
          />
          <FeedbackModal 
            isOpen={showFeedbackModal}
            onClose={closeFeedbackModal}
          />
        </>
      );
    
    default:
      return <IntroScreen onStart={handleStart} onAuth={handleAuth} />;
  }
};