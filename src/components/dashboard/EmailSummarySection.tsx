
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Inbox, 
  Clock, 
  User,
  ExternalLink,
  Loader,
  Check,
  Edit3,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface EmailSummary {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  time: string;
  isUnread: boolean;
  tags: string[];
}

// Mock data for demo purposes
const mockEmailSummaries: EmailSummary[] = [
  {
    id: "1",
    sender: "Sarah Chen",
    subject: "Q4 Project Review Meeting",
    summary: "Sarah has scheduled a Q4 review meeting...",
    time: "9:30 AM",
    isUnread: true,
    tags: ["17", "Meeting", "Internal"]
  },
  {
    id: "2",
    sender: "Marketing Team", 
    subject: "Campaign Performance Update",
    summary: "Latest campaign metrics show 23% increase in engagement. The team is requesting feedback on the new creative assets and approval for the next phase.",
    time: "5 hrs ago",
    isUnread: true,
    tags: ["Urgent", "Follow-up"]
  },
  {
    id: "3",
    sender: "Alex Rodriguez",
    subject: "Client Proposal Draft", 
    summary: "Alex has completed the first draft of the Johnson & Co proposal. He's looking for your review and wants to schedule a call to discuss pricing strategy.",
    time: "8 hrs ago",
    isUnread: false,
    tags: ["Client", "Review"]
  },
  {
    id: "4",
    sender: "Tech Support",
    subject: "System Maintenance Notice",
    summary: "Scheduled maintenance this weekend will affect the CRM system. All data will be backed up and the downtime is expected to be minimal.",
    time: "Yesterday",
    isUnread: false,
    tags: ["System", "Info"]
  }
];

export const EmailSummarySection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  // Check Gmail connection status
  useEffect(() => {
    checkGmailConnection();
  }, []);

  const checkGmailConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Checking Gmail connection for user:', user.id);

      const { data, error } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        console.log('Gmail connection found, fetching emails...');
        setIsConnected(true);
        await fetchGmailEmails();
      } else {
        console.log('No Gmail connection found');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setErrorMessage('Failed to check Gmail connection');
    }
  };

  const handleSyncGmail = async () => {
    setIsSyncing(true);
    setErrorMessage('');
    
    try {
      console.log('Starting Gmail OAuth process...');
      
      // Get authorization URL
      const response = await fetch(`https://tvbetqvpiypncjtkchcc.supabase.co/functions/v1/gmail-oauth?action=authorize`);
      const authData = await response.json();

      if (!response.ok) {
        console.error('OAuth authorization error:', authData);
        throw new Error(authData.error);
      }

      console.log('Opening OAuth popup...');

      // Set up message listener with comprehensive debugging
      const handleMessage = async (event: MessageEvent) => {
        console.log('=== MESSAGE RECEIVED ===');
        console.log('Origin:', event.origin);
        console.log('Data:', event.data);
        console.log('Data type:', typeof event.data);
        console.log('Has success property:', event.data?.success);
        console.log('Success value:', event.data?.success === true);
        
        // Accept messages from Supabase functions domain
        if (!event.origin.includes('supabase.co')) {
          console.log('Ignoring message from non-Supabase origin:', event.origin);
          return;
        }
        
        // Check if this is our OAuth success message
        if (event.data && typeof event.data === 'object' && event.data.success === true) {
          console.log('✅ OAuth SUCCESS - processing tokens...');
          
          // Remove listener immediately to prevent duplicate processing
          window.removeEventListener('message', handleMessage);
          
          try {
            console.log('Storing tokens...');
            
            // Get current session
            const { data: session } = await supabase.auth.getSession();
            
            // Store tokens using POST request directly to the edge function
            const storeResponse = await fetch(`https://tvbetqvpiypncjtkchcc.supabase.co/functions/v1/gmail-oauth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.session?.access_token}`,
              },
              body: JSON.stringify({
                tokens: event.data.tokens,
                userInfo: event.data.userInfo
              })
            });

            const storeResult = await storeResponse.json();
            console.log('Store response:', storeResult);
            
            if (!storeResponse.ok) {
              console.error('❌ Token storage failed:', storeResult);
              throw new Error(storeResult.error || 'Failed to store tokens');
            }

            console.log('✅ Tokens stored successfully');
            
            // Update UI state
            console.log('Updating connection state...');
            setIsConnected(true);
            setIsSyncing(false);
            setErrorMessage('');
            
            // Fetch emails
            console.log('Fetching Gmail emails...');
            await fetchGmailEmails();
            
            console.log('✅ Gmail sync complete!');
            
            toast({
              title: "Gmail synced successfully!",
              description: "Your emails have been fetched and summarized.",
            });
            
          } catch (storeError) {
            console.error('❌ Token storage error:', storeError);
            setErrorMessage('Failed to store Gmail tokens. Please try again.');
            setIsSyncing(false);
            toast({
              title: "Gmail sync failed",
              description: "Failed to store tokens. Please try again.",
              variant: "destructive"
            });
          }
        } else if (event.data && event.data.error) {
          console.error('❌ OAuth error:', event.data.error);
          setErrorMessage(event.data.error);
          setIsSyncing(false);
          window.removeEventListener('message', handleMessage);
          toast({
            title: "Gmail sync failed",
            description: event.data.error,
            variant: "destructive"
          });
        } else {
          console.log('Ignoring non-OAuth message:', event.data);
        }
      };

      // Add message listener before opening popup
      window.addEventListener('message', handleMessage);

      // Open OAuth popup
      const popup = window.open(
        authData.authUrl, 
        'gmail-oauth', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        window.removeEventListener('message', handleMessage);
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log('Popup closed manually');
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsSyncing(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Gmail sync error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sync Gmail');
      toast({
        title: "Gmail sync failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchGmailEmails = async () => {
    try {
      console.log('Fetching Gmail emails...');
      
      const { data, error } = await supabase.functions.invoke('fetch-gmail-emails');
      
      if (error) {
        console.error('Email fetch error:', error);
        throw error;
      }
      
      console.log('Email fetch response:', data);
      
      if (data?.emails && Array.isArray(data.emails)) {
        // Format emails to match our interface
        const formattedEmails = data.emails.map((email: any) => ({
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          summary: email.summary,
          time: new Date(email.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUnread: email.isUnread,
          tags: email.tags || []
        }));
        
        console.log('Formatted emails:', formattedEmails);
        setEmailSummaries(formattedEmails);
        setLastSyncTime(new Date().toLocaleTimeString());
        
        if (formattedEmails.length === 0) {
          setErrorMessage('No emails found in the last 48 hours');
        } else {
          setErrorMessage('');
        }
      } else {
        console.log('No emails in response, using mock data');
        setEmailSummaries(mockEmailSummaries);
        setErrorMessage('Using demo data - Gmail sync may need troubleshooting');
      }
    } catch (error) {
      console.error('Error fetching Gmail emails:', error);
      setErrorMessage('Failed to fetch emails - using demo data');
      // Fallback to mock data if Gmail fetch fails
      setEmailSummaries(mockEmailSummaries);
    }
  };

  const handleRefreshEmails = async () => {
    if (!isConnected) return;
    
    setIsSyncing(true);
    setErrorMessage('');
    await fetchGmailEmails();
    setIsSyncing(false);
  };

  const handleConnectEmail = () => {
    setIsLoading(true);
    // Simulate connection process for non-Gmail
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
              Connect Your Gmail
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get AI-powered summaries of your daily emails right in your dashboard. 
              Stay on top of what matters without inbox overload.
            </p>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}
            
            <Button 
              onClick={handleSyncGmail}
              disabled={isSyncing}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
            >
              {isSyncing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Connect Gmail
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">Today's Email Recap</h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            onClick={handleRefreshEmails}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {isSyncing ? (
              <>
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </>
            )}
          </Button>
          <Badge variant="secondary" className="text-xs">
            {emailSummaries.filter(email => email.isUnread).length} Unread
          </Badge>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6">
        {emailSummaries.map((email) => (
          <Card 
            key={email.id} 
            className="p-4 sm:p-6 bg-white border border-gray-200 transition-all duration-200 hover:shadow-lg"
          >
            {/* Header with sender, time, and unread indicator */}
            <div className="flex items-start justify-between mb-3 gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                  {email.sender}
                </h4>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {email.time}
                </span>
                {email.isUnread && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-purple-500 hidden sm:inline">Unread</span>
                  </div>
                )}
              </div>
            </div>

            <h5 className="font-medium text-foreground text-sm sm:text-base mb-2 leading-tight">
              {email.subject}
            </h5>

            <p className="text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              {email.summary}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm text-muted-foreground">Tags:</span>
              {email.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1">
                  {tag === "17" && (
                    <div className="w-4 h-4 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs font-medium">
                      17
                    </div>
                  )}
                  {tag === "Meeting" && (
                    <>
                      <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-orange-500 rounded"></div>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">{tag}</span>
                    </>
                  )}
                  {tag === "Internal" && (
                    <>
                      <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-500 rounded"></div>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">{tag}</span>
                    </>
                  )}
                  {!["17", "Meeting", "Internal"].includes(tag) && (
                    <>
                      <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">{tag}</span>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Mark Done</span>
                <span className="sm:hidden">Done</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Suggested Reply</span>
                <span className="sm:hidden">Reply</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Open in Gmail</span>
                <span className="sm:hidden">Gmail</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-primary/10 gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Last updated: {lastSyncTime || '2 minutes ago'}</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs self-start sm:self-auto">
          <ExternalLink className="w-3 h-3 mr-1" />
          Open Gmail
        </Button>
      </div>
    </div>
  );
};
