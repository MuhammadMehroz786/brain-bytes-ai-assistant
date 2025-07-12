import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Target, Sparkles } from "lucide-react";

interface DailyFocusPopupProps {
  onClose: () => void;
  onSave: (priority: string) => void;
}

export const DailyFocusPopup = ({ onClose, onSave }: DailyFocusPopupProps) => {
  const [priority, setPriority] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSave = () => {
    if (priority.trim()) {
      onSave(priority.trim());
    }
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card 
        className={`relative w-full max-w-md p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl transition-all duration-300 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        style={{ borderRadius: '24px' }}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 p-0 rounded-full hover:bg-muted/50"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Let's set your focus for today
            </h2>
            <p className="text-sm text-muted-foreground">
              What's your #1 priority right now?
            </p>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <Input
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="E.g. Finish pitch deck, write article, stay focused"
              className="text-center border-2 border-border focus:border-primary rounded-xl h-12"
              autoFocus
            />
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSave}
                disabled={!priority.trim()}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Set Focus
              </Button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center">
            This helps us personalize your daily experience
          </p>
        </div>
      </Card>
    </div>
  );
};