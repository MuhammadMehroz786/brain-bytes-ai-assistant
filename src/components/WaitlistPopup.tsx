import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistPopup = ({ isOpen, onClose }: WaitlistPopupProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    
    // Simulate API call - replace with actual waitlist signup logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "You're on the waitlist! 🎉",
      description: "We'll notify you when Brain Bytes AI launches. Check your email for confirmation.",
    });
    
    setIsSubmitting(false);
    onClose();
    setName("");
    setEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Join the Brain Bytes AI Waitlist
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Joining..." : "Join the Waitlist"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            We'll notify you when it launches. No spam, just early access.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};