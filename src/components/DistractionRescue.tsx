import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DistractionRescueProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DistractionRescue = ({ isOpen, onClose }: DistractionRescueProps) => {
  const [userInput, setUserInput] = useState("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const { toast } = useToast();
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const generateCoachingResponse = async (input: string) => {
    const newConversationHistory = [...conversationHistory, { role: "user", content: input }];
    setConversationHistory(newConversationHistory);
    setIsLoadingResponse(true);

    try {
      const { data, error } = await supabase.functions.invoke('distraction-coaching', {
        body: { conversationHistory: newConversationHistory },
      });

      if (error) throw error;

      const assistantMessage = { role: "assistant", content: data.response };
      setConversationHistory([...newConversationHistory, assistantMessage]);
    } catch (error) {
      console.error("Error generating coaching response:", error);
      toast({
        title: "Error",
        description: "There was an error generating a response. Please try again.",
        variant: "destructive",
      });
      // Remove the user's message from history if the API call fails
      setConversationHistory(conversationHistory);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleSubmitDistraction = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Tell me more",
        description: "Please describe what's pulling your focus away.",
        variant: "destructive",
      });
      return;
    }

    await generateCoachingResponse(userInput);
    setUserInput("");
  };

  const handleClose = () => {
    setConversationHistory([]);
    setUserInput("");
    setIsLoadingResponse(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              Let's Get You Back on Track
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-4 h-64 overflow-y-auto">
            {conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoadingResponse && (
              <div className="flex justify-center">
                <div className="px-4 py-2 rounded-lg bg-muted">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="I'm getting distracted by..."
              className="rounded-xl resize-none"
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitDistraction();
                }
              }}
            />
            <Button onClick={handleSubmitDistraction} disabled={!userInput.trim() || isLoadingResponse}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};