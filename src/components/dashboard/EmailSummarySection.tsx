import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail, User, AlertCircle, Loader, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmailSummary {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  aiSummary: string;
  suggestedReplies: string[];
  body: string;
}

export const EmailSummarySection = () => {
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Debug logging
  console.log('🔍 EmailSummarySection rendered - isConnected:', isConnected, 'isLoading:', isLoading);
  
  // Check if user has Gmail connected on component mount
  useEffect(() => {
    checkGmailConnection();
  }, []);
  
  const checkGmailConnection = async () => {
    try {
      // First check if we have a stored connection state in localStorage
      const storedConnection = localStorage.getItem('gmail_connected');
      const storedEmail = localStorage.getItem('gmail_email');
      
      if (storedConnection === 'true' && storedEmail) {
        console.log('📧 Found stored Gmail connection for:', storedEmail);
        setIsConnected(true);
        // Set a mock email to show connection is active
        // Fetch real emails now that we have a connection
        fetchEmails();
        return;
      }
      
      // If no stored connection, default to disconnected state
      setIsConnected(false);
      setEmailSummaries([]);
      
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setIsConnected(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      console.log('🔄 Starting Gmail connection...');

      // First, test if the OAuth server is running
      try {
        const testResponse = await fetch('http://localhost:8082/');
        if (!testResponse.ok) {
          throw new Error('OAuth server not responding');
        }
        const serverStatus = await testResponse.json();
        console.log('✅ OAuth server status:', serverStatus);
      } catch (error) {
        console.error('❌ OAuth server not running:', error);
        throw new Error('OAuth server is not running. Please start it first: node gmail-oauth-server.mjs');
      }
      
      const response = await fetch('http://localhost:8082/auth/google');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get authorization URL');
      }
      
      const { authUrl } = await response.json();
      console.log('🔗 OAuth URL generated:', authUrl);
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'gmail-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,left=200,top=200'
      );
      
      if (!popup) {
        throw new Error('Popup blocked! Please allow popups for this site.');
      }
      
      console.log('🪟 OAuth popup opened');
      
      // Listen for OAuth completion
      const handleMessage = async (event: MessageEvent) => {
        console.log('📨 Received message:', event.data);
        
        if (event.data.success) {
          try {
            console.log('✅ OAuth successful, storing tokens...');
            console.log('🎫 Received tokens:', {
              hasAccessToken: !!event.data.tokens.access_token,
              hasRefreshToken: !!event.data.tokens.refresh_token,
              expiresIn: event.data.tokens.expires_in,
              userEmail: event.data.userInfo.email
            });
            
            const storeResponse = await fetch('http://localhost:8082/store-tokens', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tokens: event.data.tokens,
                userInfo: event.data.userInfo,
              }),
            });

            if (!storeResponse.ok) {
              const errorData = await storeResponse.json().catch(() => ({ error: 'Unknown error' }));
              console.error('💥 Store response error:', errorData);
              throw new Error(`Failed to store tokens: ${errorData.error || storeResponse.status}`);
            }

            const storeResult = await storeResponse.json();
            console.log('✅ Tokens stored successfully:', storeResult);
            
            toast.success(`Gmail connected successfully! (${event.data.userInfo.email})`);
            
            // Store connection state in localStorage for persistence
            localStorage.setItem('gmail_connected', 'true');
            localStorage.setItem('gmail_email', event.data.userInfo.email);
            localStorage.setItem('gmail_access_token', event.data.tokens.access_token);
            
            setIsConnected(true);
            
            // Show success email
            setEmailSummaries([
              {
                id: '1',
                senderName: 'Gmail OAuth',
                senderEmail: event.data.userInfo.email,
                subject: 'Connection Successful!',
                date: new Date().toISOString(),
                snippet: 'Your Gmail account has been successfully connected. Email fetching will be implemented next.',
                aiSummary: 'Gmail OAuth flow completed successfully. Ready to fetch and summarize emails.',
                suggestedReplies: [],
                body: 'Gmail connection established successfully.'
              }
            ]);
          } catch (error) {
            console.error('❌ Error storing tokens:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to store tokens');
            setErrorMessage(error instanceof Error ? error.message : 'Failed to store tokens');
          }
          
          popup?.close();
        } else if (event.data.error) {
          console.error('❌ OAuth error:', event.data.error);
          toast.error(`OAuth failed: ${event.data.error}`);
          setErrorMessage(`OAuth failed: ${event.data.error}`);
        }
        
        window.removeEventListener('message', handleMessage);
        setIsLoading(false);
      };
      
      window.addEventListener('message', handleMessage);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          console.log('🪟 Popup was closed manually');
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
          toast.info('OAuth popup was closed');
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Gmail connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Gmail';
      toast.error(errorMessage);
      setErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchEmails = async (pageToken: string | null = null) => {
    setIsSyncing(true);
    setErrorMessage('');

    try {
      const userEmail = localStorage.getItem('gmail_email');
      if (!userEmail) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('http://localhost:8082/fetch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: userEmail,
          pageToken: pageToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.emails)) {
        setEmailSummaries(prevEmails => pageToken ? [...prevEmails, ...data.emails] : data.emails);
        setNextPageToken(data.nextPageToken || null);
      }
      setLastSyncTime(new Date().toLocaleTimeString());

    } catch (error) {
      console.error('Error fetching emails:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch emails';
      setErrorMessage(errorMsg);
      
      if (errorMsg.includes('Gmail not connected')) {
        setIsConnected(false);
      }
      
      toast.error(errorMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefreshEmails = () => {
    if (!isConnected) return;
    fetchEmails();
  };

  const handleDisconnectEmail = async () => {
    try {
      // Remove stored connection state
      localStorage.removeItem('gmail_connected');
      localStorage.removeItem('gmail_email');
      
      setIsConnected(false);
      setEmailSummaries([]);
      setLastSyncTime('');
      toast.success('Gmail disconnected successfully.');
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast.error('Failed to disconnect Gmail');
    }
  };

  // Disconnected View
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Today's Email Recap</h2>
          <div className="text-xs bg-green-100 px-2 py-1 rounded">OAuth Component ✅</div>
        </div>

        <Card className="p-8 bg-white/50 backdrop-blur-sm border border-primary/10 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Connect Your Google Account
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in with Google to get AI-powered summaries of your recent emails.
              We only require read-only access.
            </p>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}
            
            <Button 
              onClick={handleConnectGmail}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <><Loader className="w-4 h-4 mr-2 animate-spin" />Connecting...</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" />Connect Gmail</>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Connected View
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
              <><Loader className="w-3 h-3 mr-1 animate-spin" />Syncing...</>
            ) : (
              <><RefreshCw className="w-3 h-3 mr-1" />Refresh</>
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
            {emailSummaries.length} Emails
          </Badge>
        </div>
      </div>
      
      {/* Loading state and email display */}
      <div className="grid gap-4 sm:gap-6">
        {isSyncing && emailSummaries.length === 0 ? (
           <div className="flex justify-center items-center p-8">
             <Loader className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : emailSummaries.length === 0 ? (
          <Card className="p-8 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Emails Found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't find any recent emails. Try refreshing in a bit.
            </p>
          </Card>
        ) : (
          emailSummaries.map((email, index) => (
            <Card 
              key={`${email.subject}-${index}`} // Using index as a fallback key
              className="p-4 sm:p-6 bg-white border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                      {email.senderName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {email.senderEmail}
                    </p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(email.date).toLocaleDateString()}
                </span>
              </div>

              <h5 className="font-medium text-foreground text-sm sm:text-base mb-2 leading-tight">
                {email.subject}
              </h5>

              <p className="text-sm text-muted-foreground mb-4">{email.snippet}</p>

              {email.aiSummary && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-xs font-medium text-blue-700">AI Summary</span>
                  <p className="text-sm text-blue-800 mt-1">
                    {email.aiSummary}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
      {nextPageToken && (
        <div className="flex justify-center">
          <Button onClick={() => fetchEmails(nextPageToken)} disabled={isSyncing}>
            {isSyncing ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};