import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistSignupProps {
  isOpen: boolean;
  onClose: () => void;
  triggerText?: string;
}

export const WaitlistSignup = ({ isOpen, onClose, triggerText }: WaitlistSignupProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('prelaunch_roi_waitlist')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          toast.error("You're already on the waitlist!");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      toast.success("You're on the waitlist! We'll notify you when the Brain Bytes Education Hub launches.");
      
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setEmail("");
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-primary/20 shadow-xl rounded-2xl p-6 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center mx-auto animate-scale-in">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">You're in!</h3>
            <p className="text-muted-foreground">
              We'll notify you as soon as the Brain Bytes Education Hub launches.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">Join the Waitlist</h3>
              <p className="text-muted-foreground text-sm">
                Be the first to get access to your personalized AI toolkit
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span>
                  <span>One-time $29 fee - No subscriptions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span>
                  <span>100% personalized AI recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span>
                  <span>Instant access when we launch</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-muted-foreground/20 focus:border-primary transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Joining...
                    </div>
                  ) : (
                    "Join the Waitlist"
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};