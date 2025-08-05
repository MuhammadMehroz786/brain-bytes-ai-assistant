import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { generateProductivityPlan } from "@/utils/productivityGenerator";
import type { UserResponses, ProductivityPlan } from "@/types/productivity";

interface ProductivityPlanResultsProps {
  userResponses: UserResponses | null;
  productivityPlan: ProductivityPlan | null;
  onRestart: () => void;
  setUserResponses: (responses: UserResponses) => void;
  setProductivityPlan: (plan: ProductivityPlan) => void;
}

export const ProductivityPlanResults = ({ 
  userResponses, 
  productivityPlan, 
  onRestart,
  setUserResponses,
  setProductivityPlan 
}: ProductivityPlanResultsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      // For returning users, generate a sample plan if none exists
      if (!productivityPlan || !userResponses) {
        setIsLoading(true);
        try {
          const sampleResponses: UserResponses = {
            productivityStruggle: "focus",
            goals: "efficiency", 
            currentTools: "digital",
            aiFamiliarity: "some",
            productiveTime: "morning"
          };
          const samplePlan = await generateProductivityPlan(sampleResponses);
          setUserResponses(sampleResponses);
          setProductivityPlan(samplePlan);
        } catch (error) {
          console.error('Error generating sample plan:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPlan();
  }, [userResponses, productivityPlan, setUserResponses, setProductivityPlan]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-light via-primary-light to-success-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating your productivity plan...</p>
        </div>
      </div>
    );
  }

  if (!productivityPlan || !userResponses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-light via-primary-light to-success-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load productivity plan</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      plan={productivityPlan}
      responses={userResponses}
      onRestart={onRestart}
    />
  );
};