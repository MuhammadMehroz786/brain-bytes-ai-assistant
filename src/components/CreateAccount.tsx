import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, validatePassword, normalizeEmail, logSecurityEvent } from "@/utils/security";
import { secureSignUp } from "@/utils/secureAuth";

interface CreateAccountProps {
  onAccountCreated: () => void;
}

// Rate limiting is now handled server-side

export const CreateAccount = ({ onAccountCreated }: CreateAccountProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await secureSignUp(email, password);
      
      if (!result.success) {
        toast({
          title: "Account creation failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
        onAccountCreated();
      }
    } catch (error: any) {
      toast({
        title: "Account creation error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-light via-primary-light to-success-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Create Your Account
          </h1>
          <p className="text-muted-foreground">
            Set up your account to access your AI productivity plan
          </p>
        </div>

        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account & Continue"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          After creating your account, you'll answer 5 quick questions to unlock your personalized AI productivity system.
        </p>
      </Card>
    </div>
  );
};