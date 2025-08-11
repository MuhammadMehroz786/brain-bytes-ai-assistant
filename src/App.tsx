
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import RefundPolicy from "./pages/RefundPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsent from "./components/CookieConsent";
import AIEducationHub from "./pages/AIEducationHub";

const queryClient = new QueryClient();

const AppContent = ({ googleClientId }: { googleClientId: string }) => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/education" element={<AIEducationHub />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </GoogleOAuthProvider>
);

const App = () => {
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoogleClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-client-id');
        
        if (error) {
          console.error('Error fetching Google Client ID:', error);
          // Fallback to hardcoded value for development
          setGoogleClientId("462032172381-rhempvkgs9st5obdvm476c4phnk02rj3.apps.googleusercontent.com");
        } else {
          setGoogleClientId(data.clientId);
        }
      } catch (error) {
        console.error('Error fetching Google Client ID:', error);
        // Fallback to hardcoded value for development
        setGoogleClientId("462032172381-rhempvkgs9st5obdvm476c4phnk02rj3.apps.googleusercontent.com");
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleClientId();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent googleClientId={googleClientId} />
    </QueryClientProvider>
  );
};

export default App;
