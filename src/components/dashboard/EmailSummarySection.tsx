import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Mail, Clock, User, Send, CheckCircle, Undo2, ExternalLink, Plus, AlertCircle, Loader, LogOut } from 'lucide-react';
import { toast } from 'sonner';
// Import Firebase modules instead of Supabase
import { auth, functions, httpsCallable } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// The interface for email summary remains the same
interface EmailSummary {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  date: string;
  ai_summary: string;
  suggested_replies: string[];
  body: string;
  is_done?: boolean;
}

export const EmailSummarySection = () => {
  // Use Firebase's auth state hook
  const [user, authLoading] = useAuthState(auth);

  const [isConnected, setIsConnected] = useState(false);
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReplies, setSendingReplies] = useState<Set<string>>(new Set());
  const [doneEmails, setDoneEmails] = useState<Set<string>>(new Set());
  const [lastDoneEmail, setLastDoneEmail] = useState<string | null>(null);

  // This function now checks for a refresh token on your backend
  const checkEmailConnection = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // The 'syncEmails' function will fail if no token exists, which tells us if the user is connected.
      const syncEmails = httpsCallable(functions, 'syncEmails');
      const result = await syncEmails();

      if (result.data) {
        setIsConnected(true);
        setEmailSummaries((result.data as any).emails);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (error: any) {
      // A 'failed-precondition' error from our backend means the user has not connected their Gmail yet.
      if (error.code === 'functions/failed-precondition') {
        setIsConnected(false);
        setEmailSummaries([]);
      } else {
        console.error('Error checking email connection:', error);
        setErrorMessage('Failed to check connection status.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkEmailConnection();
    } else if (!authLoading) {
      setIsLoading(false); // If no user and not loading, stop loading
    }
  }, [user, authLoading]);

  // This now triggers the OAuth flow
  const handleConnectEmail = async () => {
    setIsConnecting(true);
    setErrorMessage('');
    try {
      const connectGmail = httpsCallable(functions, 'connectGmail');
      const result = await connectGmail();
      const { authUrl } = result.data as { authUrl: string };

      if (authUrl) {
        // Redirect the user to the Google authorization page
        window.location.href = authUrl;
      } else {
        throw new Error('Could not get authorization URL.');
      }
    } catch (error) {
      console.error('Email connection error:', error);
      const errorMsg = 'Failed to start the connection process.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsConnecting(false);
    }
  };

  const fetchEmails = async () => {
    if (!isConnected) return;
    setIsSyncing(true);
    setErrorMessage('');
    try {
      const syncEmails = httpsCallable(functions, 'syncEmails');
      const result = await syncEmails();
      
      if ((result.data as any).emails) {
        setEmailSummaries((result.data as any).emails);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      const errorMsg = 'Failed to sync emails.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleSendReply = async (email: EmailSummary, replyText: string) => {
    setSendingReplies(prev => new Set(prev).add(email.id));
    try {
      const sendReply = httpsCallable(functions, 'sendReply');
      await sendReply({
        to_email: email.sender_email,
        subject: email.subject,
        reply_text: replyText,
        // The backend expects 'message_id_header', which we have as 'id'
        message_id_header: email.id, 
      });

      toast.success('Reply sent successfully!');
      setReplyTexts(prev => ({ ...prev, [email.id]: '' }));
      setExpandedEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(email.id);
        return newSet;
      });

    } catch (error) {
      console.error('Send reply error:', error);
      toast.error('Failed to send reply.');
    } finally {
      setSendingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(email.id);
        return newSet;
      });
    }
  };

  // Note: mark as done/undo logic is now client-side only as the backend doesn't handle it.
  // This could be extended by creating a Firestore collection to track 'done' emails.
  const handleMarkAsDone = (emailId: string) => {
    setDoneEmails(prev => new Set(prev).add(emailId));
    setLastDoneEmail(emailId);
    toast.success('Email marked as done');
  };

  const handleUndoMarkAsDone = () => {
    if (!lastDoneEmail) return;
    setDoneEmails(prev => {
      const newSet = new Set(prev);
      newSet.delete(lastDoneEmail);
      return newSet;
    });
    setLastDoneEmail(null);
    toast.success('Action undone');
  };

  // This function would ideally call a backend function to delete the user's refresh token
  const handleDisconnectEmail = async () => {
    // To fully implement this, you would create a new Cloud Function e.g., 'disconnectGmail'
    // that deletes the user's token document from Firestore.
    // For now, we'll simulate it on the client.
    setIsConnected(false);
    setEmailSummaries([]);
    setDoneEmails(new Set());
    setLastSyncTime('');
    toast.success('Email disconnected successfully');
  };
  
  const visibleEmails = emailSummaries.filter(email => !doneEmails.has(email.id));
  const unreadCount = visibleEmails.length;
  
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Connect Your Gmail Account
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Get AI-powered summaries of your daily emails. Connect your Gmail account to securely sync your inbox.
                    </p>
                    
                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errorMessage}
                        </div>
                    )}
                    
                    <Button 
                        onClick={handleConnectEmail}
                        disabled={isConnecting}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
                    >
                        {isConnecting ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Connect Gmail
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
  }

  // The rest of your JSX for displaying emails remains largely the same.
  // ... (paste the rest of your return() JSX here)
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
          onClick={fetchEmails}
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
        <Button 
          onClick={handleDisconnectEmail}
          variant="outline"
          size="sm"
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-3 h-3 mr-1" />
          Disconnect
        </Button>
        <Badge variant="secondary" className="text-xs">
          {unreadCount} Emails
        </Badge>
        {lastDoneEmail && (
          <Button
            onClick={handleUndoMarkAsDone}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Undo2 className="w-3 h-3 mr-1" />
            Undo
          </Button>
        )}
      </div>
    </div>

    {errorMessage && (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700 text-sm">
        <AlertCircle className="w-4 h-4" />
        {errorMessage}
      </div>
    )}

    {lastSyncTime && (
      <p className="text-xs text-muted-foreground mb-4">
        Last synced: {lastSyncTime}
      </p>
    )}

    <div className="grid gap-4 sm:gap-6">
      {visibleEmails.length === 0 ? (
        <Card className="p-8 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">All Caught Up!</h3>
          <p className="text-sm text-muted-foreground">
            No new emails to process. Check back later or refresh to sync new messages.
          </p>
        </Card>
      ) : (
        visibleEmails.map((email) => {
          const isExpanded = expandedEmails.has(email.id);
          const replyText = replyTexts[email.id] || '';
          const isSending = sendingReplies.has(email.id);

          return (
            <Card 
              key={email.id} 
              className="p-4 sm:p-6 bg-white border border-gray-200 transition-all duration-200 hover:shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                      {email.sender_name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {email.sender_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <h5 className="font-medium text-foreground text-sm sm:text-base mb-2 leading-tight">
                {email.subject}
              </h5>

              {/* AI Summary */}
              {email.ai_summary && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded"></div>
                    </div>
                    <span className="text-xs font-medium text-blue-700">AI Summary</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    {email.ai_summary}
                  </p>
                </div>
              )}

              {/* Suggested Replies */}
              {email.suggested_replies && email.suggested_replies.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {email.suggested_replies.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => setReplyTexts(prev => ({ ...prev, [email.id]: reply }))}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Body (Expandable) */}
              {isExpanded && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {email.body}
                  </p>
                </div>
              )}

              {/* Reply Section */}
              {isExpanded && (
                <div className="mb-4 space-y-3">
                  <Label htmlFor={`reply-${email.id}`} className="text-sm font-medium">
                    Your Reply
                  </Label>
                  <Textarea
                    id={`reply-${email.id}`}
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [email.id]: e.target.value }))}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSendReply(email, replyText)}
                      disabled={!replyText.trim() || isSending}
                      size="sm"
                    >
                      {isSending ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                <Button
                  onClick={() => toggleEmailExpanded(email.id)}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </Button>
                <Button
                  onClick={() => handleMarkAsDone(email.id)}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mark as Done
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </div>
  </div>
  );
};