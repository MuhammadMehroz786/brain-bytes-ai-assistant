import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Inbox, 
  Clock, 
  User,
  ExternalLink,
  Loader
} from "lucide-react";

interface EmailSummary {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  time: string;
  isUnread: boolean;
}

// Mock data for demo purposes
const mockEmailSummaries: EmailSummary[] = [
  {
    id: "1",
    sender: "Sarah Chen",
    subject: "Q4 Project Review Meeting",
    summary: "Sarah has scheduled a Q4 review meeting for Friday at 2 PM. She's requesting project status updates and wants to discuss budget allocations for next quarter.",
    time: "9:30 AM",
    isUnread: true
  },
  {
    id: "2",
    sender: "Marketing Team",
    subject: "Campaign Performance Update",
    summary: "Latest campaign metrics show 23% increase in engagement. The team is requesting feedback on the new creative assets and approval for the next phase.",
    time: "8:45 AM",
    isUnread: true
  },
  {
    id: "3",
    sender: "Alex Rodriguez",
    subject: "Client Proposal Draft",
    summary: "Alex has completed the first draft of the Johnson & Co proposal. He's looking for your review and wants to schedule a call to discuss pricing strategy.",
    time: "7:22 AM",
    isUnread: false
  },
  {
    id: "4",
    sender: "Tech Support",
    subject: "System Maintenance Notice",
    summary: "Scheduled maintenance this weekend will affect the CRM system. All data will be backed up and the downtime is expected to be minimal.",
    time: "Yesterday",
    isUnread: false
  }
];

export const EmailSummarySection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate email connection status
  useEffect(() => {
    const connected = localStorage.getItem('emailConnected') === 'true';
    setIsConnected(connected);
    if (connected) {
      setEmailSummaries(mockEmailSummaries);
    }
  }, []);

  const handleConnectEmail = () => {
    setIsLoading(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setEmailSummaries(mockEmailSummaries);
      localStorage.setItem('emailConnected', 'true');
      setIsLoading(false);
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Today's Email Recap</h2>
        </div>

        <Card className="p-8 bg-white/50 backdrop-blur-sm border border-primary/10 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Connect Your Email
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get AI-powered summaries of your daily emails right in your dashboard. 
              Stay on top of what matters without inbox overload.
            </p>
            <Button 
              onClick={handleConnectEmail}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Connect Email
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Today's Email Recap</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {emailSummaries.filter(email => email.isUnread).length} Unread
        </Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {emailSummaries.map((email) => (
            <Card 
              key={email.id} 
              className={`p-4 bg-white/50 backdrop-blur-sm border transition-all duration-200 hover:shadow-md ${
                email.isUnread 
                  ? "border-primary/20 bg-primary/5" 
                  : "border-primary/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {email.sender}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {email.time}
                      </span>
                      {email.isUnread && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2 truncate">
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {email.summary}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Last updated: 2 minutes ago</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          <ExternalLink className="w-3 h-3 mr-1" />
          Open Gmail
        </Button>
      </div>
    </div>
  );
};