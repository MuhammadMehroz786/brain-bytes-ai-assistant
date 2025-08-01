// src/components/EmailSummarySection.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail, User, AlertCircle, Loader, LogOut } from 'lucide-react';
import { toast } from 'sonner';
// NEW: Import the Google OAuth components and hooks
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';

// CHANGED: This interface now matches the data structure from your Express backend.
interface EmailSummary {
  subject: string;
  from: string; // Contains sender name and email
  date: string;
  snippet: string;
  aiSummary: string;
}

// The URL of your running Express backend
const BACKEND_URL = "http://localhost:5000";

export const EmailSummarySection = () => {
  // NEW: State to hold the Google OAuth access token
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // A 'connected' status is now simply whether we have a token or not
  const isConnected = !!accessToken;

  // NEW: Function to handle a successful login from Google
  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      // For ID token based authentication, we'd need to decode the JWT
      // For now, we'll simulate having an access token for demo purposes
      toast.success('Successfully connected to Google!');
      setAccessToken('demo_token'); // This would be replaced with proper OAuth flow
    } else {
      toast.error("No credential received from Google.");
    }
  };

  const handleLoginError = () => {
    toast.error('Google login failed. Please try again.');
    setErrorMessage('Failed to connect to Google. Check console for details.');
  };

  // CHANGED: This function now fetches data from your Express backend.
  const fetchEmails = async (token: string) => {
    setIsSyncing(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/getEmails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }), // Send the token in the request body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmailSummaries(data.emails);
      setLastSyncTime(new Date().toLocaleTimeString());

    } catch (error) {
      console.error('Error fetching emails:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch emails';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  // NEW: This effect runs whenever the accessToken changes.
  useEffect(() => {
    if (accessToken) {
      fetchEmails(accessToken);
    }
  }, [accessToken]);


  const handleRefreshEmails = () => {
    if (!accessToken) return;
    fetchEmails(accessToken);
  };

  // CHANGED: Disconnecting is now client-side. We log out from Google and clear the token.
  const handleDisconnectEmail = () => {
    googleLogout(); // Clears the Google session
    setAccessToken(null);
    setEmailSummaries([]);
    setLastSyncTime('');
    toast.success('Disconnected successfully.');
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
            
            {/* NEW: Using the GoogleLogin component for a simple login flow */}
            <div className='flex justify-center'>
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                />
            </div>
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
                      {email.from}
                    </h4>
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
    </div>
  );
};