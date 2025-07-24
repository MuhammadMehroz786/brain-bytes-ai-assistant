
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const handlePaymentClick = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment');
    if (error) throw error;
    
    if (data?.url) {
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};

const Demo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#f5f7ff] to-[#f2f4ff]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-[#f8f9ff] via-[#f5f7ff] to-[#f2f4ff] backdrop-blur-sm border-b border-primary/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center text-primary hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-light rounded-xl mr-3">
              <img alt="Brain Bytes Logo" className="w-6 h-6 object-contain" src="/lovable-uploads/9c3a30a8-9cbd-4bb9-a556-df32452393d0.png" />
            </div>
            <span className="text-lg font-bold text-foreground">Brain Bytes</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See Brain Bytes in Action
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch this 60-second demo to see how Brain Bytes transforms your daily productivity with personalized AI insights.
            </p>
          </div>

          {/* Video Section */}
          <Card className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
            <div className="rounded-xl overflow-hidden bg-black/5 border border-primary/10 shadow-lg">
              <iframe 
                src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ" 
                width="100%" 
                height="400" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                className="w-full aspect-video"
                title="Brain Bytes Demo"
              />
            </div>
          </Card>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden min-h-screen flex flex-col overflow-hidden">
          <div className="text-center mb-3 px-4">
            <h1 className="text-xl font-bold text-foreground">
              Brain Bytes Demo
            </h1>
          </div>

          {/* Mobile Video Section */}
          <div className="px-4 space-y-4 flex-1">
            <Card className="p-2 bg-white/80 backdrop-blur-sm border-primary/20">
              <div className="rounded-lg overflow-hidden bg-black/5 border border-primary/10 shadow-lg">
                <iframe 
                  src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ" 
                  width="100%" 
                  height="160" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  className="w-full"
                  title="Brain Bytes Demo"
                />
              </div>
            </Card>

            {/* Primary CTA */}
            <div className="text-center">
              <Button 
                onClick={handlePaymentClick}
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Your AI Assistant – $29 One-Time Fee
              </Button>
            </div>

            {/* Benefit Blocks */}
            <div className="space-y-2">
              <div className="flex items-center p-2 bg-white/60 rounded-lg border border-primary/10">
                <div className="w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs">⚡</span>
                </div>
                <span className="text-xs text-foreground font-medium">Save hours every week on repetitive tasks</span>
              </div>
              
              <div className="flex items-center p-2 bg-white/60 rounded-lg border border-primary/10">
                <div className="w-6 h-6 bg-accent text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs">🧠</span>
                </div>
                <span className="text-xs text-foreground font-medium">Unlock personalized AI insights instantly</span>
              </div>
              
              <div className="flex items-center p-2 bg-white/60 rounded-lg border border-primary/10">
                <div className="w-6 h-6 bg-success text-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs">💰</span>
                </div>
                <span className="text-xs text-foreground font-medium">Gain thousands in productivity value for $29</span>
              </div>
            </div>

            {/* What You'll Unlock */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground text-center">What You'll Unlock</h3>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="p-2 bg-white/60 rounded-lg border border-primary/10 text-center">
                  <div className="w-5 h-5 bg-primary text-white rounded-lg flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs">📋</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">Daily Briefing</div>
                  <div className="text-xs text-muted-foreground">Stay ahead every morning</div>
                </div>
                
                <div className="p-2 bg-white/60 rounded-lg border border-primary/10 text-center">
                  <div className="w-5 h-5 bg-accent text-white rounded-lg flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs">📧</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">Email Summary</div>
                  <div className="text-xs text-muted-foreground">No more inbox overwhelm</div>
                </div>
                
                <div className="p-2 bg-white/60 rounded-lg border border-primary/10 text-center">
                  <div className="w-5 h-5 bg-success text-white rounded-lg flex items-center justify-center mx-auto mb-1">
                    <span className="text-xs">🎵</span>
                  </div>
                  <div className="text-xs font-medium text-foreground">Focus Playlist</div>
                  <div className="text-xs text-muted-foreground">Get in the zone instantly</div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="text-center py-2">
              <div className="p-2 bg-gradient-to-r from-primary-light/50 to-accent-light/50 rounded-lg border border-primary/10">
                <p className="text-xs text-foreground italic">
                  "It helped me reclaim 5+ hours a week instantly."
                </p>
                <p className="text-xs text-muted-foreground mt-1">– Beta User</p>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center pb-4">
              <Button 
                onClick={handlePaymentClick}
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Your AI Assistant – $29 One-Time Fee
              </Button>
            </div>
          </div>
        </div>

        {/* Key Features - Desktop Only */}
        <div className="hidden md:block mt-12">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">2-Minute Setup</h3>
              <p className="text-sm text-muted-foreground">
                Answer 5 quick questions and get your personalized AI assistant instantly.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-to-br from-accent-light to-success-light border-accent/20">
              <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🧠</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Calendar Sync</h3>
              <p className="text-sm text-muted-foreground">
                Automatically sync your Google Calendar and get AI insights on your schedule.
              </p>
            </Card>

            <Card className="p-6 text-center bg-gradient-to-br from-success-light to-primary-light border-success/20">
              <div className="w-12 h-12 bg-success text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📧</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Summary</h3>
              <p className="text-sm text-muted-foreground">
                Get curated daily email recaps without inbox overload.
              </p>
            </Card>
          </div>

          {/* CTA Section - Desktop Only */}
          <div className="mt-12 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Ready to transform your productivity?
              </h2>
              <p className="text-muted-foreground">
                Join thousands of users who've already unlocked their AI productivity assistant.
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              <Button 
                onClick={handlePaymentClick}
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Your AI Assistant – $29 One-Time Fee
              </Button>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>One-time payment</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>No monthly fees</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
