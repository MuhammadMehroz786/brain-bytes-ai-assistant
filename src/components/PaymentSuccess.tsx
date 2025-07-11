import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Brain } from "lucide-react";

interface PaymentSuccessProps {
  onCreateAccount: () => void;
}

export const PaymentSuccess = ({ onCreateAccount }: PaymentSuccessProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    setSessionId(sessionIdParam);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-light via-primary-light to-accent-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success-light rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-4">
            Thank you for purchasing Brain Bytes AI Productivity Assistant.
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground mb-4">
              Order ID: {sessionId.slice(-8)}
            </p>
          )}
        </div>

        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-xl mb-3">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Next Step</h3>
          <p className="text-sm text-muted-foreground">
            Create your account to access your personalized AI productivity plan
          </p>
        </div>

        <Button 
          onClick={onCreateAccount}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-xl"
        >
          Create My Account
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          You'll be able to start building your personalized productivity plan right after account creation.
        </p>
      </Card>
    </div>
  );
};