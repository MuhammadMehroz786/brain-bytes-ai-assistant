import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail, User, AlertCircle, Loader, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleLogin } from '@react-oauth/google';

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('✅ Google OAuth successful:', tokenResponse);
        
        // Get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userInfoResponse.json();
        
        console.log('👤 User info:', userInfo);
        
        // Store tokens and user info in localStorage
        localStorage.setItem('gmail_connected', 'true');
        localStorage.setItem('gmail_email', userInfo.email);
        localStorage.setItem('gmail_access_token', tokenResponse.access_token);
        
        setIsConnected(true);
        toast.success(`Gmail connected successfully! (${userInfo.email})`);
        
        // Fetch emails directly using the access token
        fetchEmailsWithToken(tokenResponse.access_token, userInfo.email);
        
      } catch (error) {
        console.error('❌ Error handling OAuth success:', error);
        toast.error('Failed to complete Gmail connection');
        setErrorMessage('Failed to complete Gmail connection');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('❌ Google OAuth error:', error);
      toast.error('Gmail connection failed');
      setErrorMessage('Gmail connection failed');
      setIsLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly email profile'
  });

  const handleConnectGmail = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('🔄 Starting Gmail connection...');
      googleLogin();
    } catch (error) {
      console.error('❌ Gmail connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Gmail';
      toast.error(errorMessage);
      setErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchEmailsWithToken = async (accessToken: string, userEmail: string, pageToken: string | null = null) => {
    try {
      // Fetch emails from Gmail API directly
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const afterTimestamp = Math.floor(twentyFourHoursAgo.getTime() / 1000);
      
      const query = `after:${afterTimestamp}`;
      let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=${query}`;
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const gmailResponse = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!gmailResponse.ok) {
        throw new Error('Failed to fetch emails from Gmail API');
      }

      const gmailData = await gmailResponse.json();
      const messages = gmailData.messages || [];

      console.log(`📨 Found ${messages.length} messages`);

      const processedEmails = [];

      for (const message of messages) {
        try {
          const messageResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            }
          );

          if (!messageResponse.ok) continue;

          const messageData = await messageResponse.json();
          const headers = messageData.payload.headers || [];
          
          const getHeader = (name: string) => headers.find((h: any) => 
            h.name.toLowerCase() === name.toLowerCase()
          )?.value || '';
          
          const from = getHeader('from');
          const subject = getHeader('subject');
          const date = new Date(parseInt(messageData.internalDate)).toISOString();
          
          const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/) || [null, from.split('@')[0], from];
          const senderName = fromMatch[1]?.replace(/"/g, '').trim() || fromMatch[2]?.split('@')[0] || 'Unknown';
          const senderEmail = fromMatch[2] || from;
          
          processedEmails.push({
            id: messageData.id,
            senderName,
            senderEmail,
            subject: subject || 'No Subject',
            date,
            snippet: messageData.snippet || '',
            aiSummary: `Email from ${senderName}: ${subject}`,
            suggestedReplies: [
              "Thank you for your email.",
              "I'll review this and get back to you.",
              "Thanks for reaching out."
            ],
            body: messageData.snippet || ''
          });
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error);
        }
      }

      setEmailSummaries(prevEmails => pageToken ? [...prevEmails, ...processedEmails] : processedEmails);
      setNextPageToken(gmailData.nextPageToken || null);
      setLastSyncTime(new Date().toLocaleTimeString());

    } catch (error) {
      console.error('Error fetching emails with token:', error);
      throw error;
    }
  };

  const fetchEmails = async (pageToken: string | null = null) => {
    setIsSyncing(true);
    setErrorMessage('');

    try {
      const accessToken = localStorage.getItem('gmail_access_token');
      const userEmail = localStorage.getItem('gmail_email');
      
      if (!accessToken || !userEmail) {
        throw new Error('Not authenticated');
      }
      
      await fetchEmailsWithToken(accessToken, userEmail, pageToken);

    } catch (error) {
      console.error('Error fetching emails:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch emails';
      setErrorMessage(errorMsg);
      
      if (errorMsg.includes('Not authenticated')) {
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