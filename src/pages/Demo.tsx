
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f5ff] via-[#f0f8ff] to-[#ffffff]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-[#f5f5ff] via-[#f0f8ff] to-[#ffffff] backdrop-blur-sm border-b border-primary/10 px-6 py-4">
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
        <div className="md:hidden h-screen flex flex-col overflow-hidden">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Brain Bytes Demo
            </h1>
          </div>

          {/* Mobile Video Section */}
          <div className="flex-1 px-2 space-y-4">
            <Card className="p-3 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
              <div className="rounded-lg overflow-hidden bg-black/5 border border-primary/10 shadow-lg">
                <iframe 
                  src="https://www.youtube.com/embed/1NnXmp1M0KM?si=Asn2O2q2UQgNz7HZ" 
                  width="100%" 
                  height="200" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  className="w-full"
                  title="Brain Bytes Demo"
                />
              </div>
            </Card>

            {/* Mobile CTA */}
            <div className="text-center px-2">
              <Link to="/">
                <Button 
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Your AI Assistant – $29 One-Time Fee
                </Button>
              </Link>
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
              <Link to="/">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get Your AI Assistant – $29 One-Time Fee
                </Button>
              </Link>
              
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
