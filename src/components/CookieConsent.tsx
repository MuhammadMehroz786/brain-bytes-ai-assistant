import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    if (cookieChoice) {
      setHasInteracted(true);
      return;
    }

    // Show banner after 3 seconds or on scroll
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsVisible(true);
      }
    }, 3000);

    const handleScroll = () => {
      if (window.scrollY > 100 && !hasInteracted) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasInteracted]);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    setHasInteracted(true);
    // Enable analytics and other non-essential cookies
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
      });
    }
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('cookieConsent', 'essential-only');
    setIsVisible(false);
    setHasInteracted(true);
    // Keep only essential cookies
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
      });
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || hasInteracted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="w-6 h-6 text-[#7C3AED] mt-1" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We use cookies to enhance your experience
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We use essential cookies to make our site work. We'd also like to set optional analytics cookies to help us improve it. We won't set optional cookies unless you enable them. 
                <Link to="/cookie-policy" className="text-[#7C3AED] hover:text-[#6D28D9] underline ml-1">
                  Learn more about cookies
                </Link>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Accept all cookies
                </Button>
                <Button
                  onClick={handleRejectNonEssential}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
                >
                  Essential cookies only
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss cookie banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
