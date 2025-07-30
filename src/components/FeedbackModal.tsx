import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ratingEmojis = [
  { value: 1, emoji: "😞", label: "Not helpful" },
  { value: 2, emoji: "😐", label: "Somewhat helpful" },
  { value: 3, emoji: "🙂", label: "Helpful" },
  { value: 4, emoji: "😊", label: "Very helpful" },
  { value: 5, emoji: "🤩", label: "Extremely helpful" },
];

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id || null,
          rating,
          feedback_text: feedbackText || null,
        });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve the AI Assistant.",
      });

      // Reset form and close modal
      setRating(null);
      setFeedbackText("");
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(null);
    setFeedbackText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">How helpful has the AI Assistant been so far?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rating Selection */}
          <div className="flex justify-center space-x-2">
            {ratingEmojis.map((item) => (
              <button
                key={item.value}
                onClick={() => setRating(item.value)}
                className={`p-3 rounded-lg transition-all hover:scale-110 ${
                  rating === item.value 
                    ? 'bg-primary/20 ring-2 ring-primary' 
                    : 'hover:bg-muted'
                }`}
                title={item.label}
              >
                <span className="text-2xl">{item.emoji}</span>
              </button>
            ))}
          </div>

          {rating && (
            <p className="text-center text-sm text-muted-foreground">
              {ratingEmojis.find(item => item.value === rating)?.label}
            </p>
          )}

          {/* Optional feedback text */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Any feedback or feature ideas? (Optional)
            </label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you'd like to see improved or added..."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Skip
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!rating || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};