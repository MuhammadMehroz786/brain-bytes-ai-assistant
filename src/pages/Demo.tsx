
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { WaitlistSignup } from "@/components/WaitlistSignup";
import { useState } from "react";

const Demo = () => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
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
          <Button
            onClick={() => setIsWaitlistOpen(true)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
          >
            Join the Waitlist
          </Button>
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
              Watch this 60-second demo to see how Brain Bytes creates <span className="text-primary font-semibold">your own curated AI toolkit</span> that transforms your daily productivity with personalized insights.
            </p>
          </div>

          {/* Video Section */}
          <Card className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-primary-light to-accent-light border-primary/20">
            <div className="rounded-3xl overflow-hidden bg-black/5 border border-primary/10 shadow-lg">
              <img 
                src="/lovable-uploads/b20e6ad1-c463-49d2-840e-0936dfe78118.png" 
                alt="Brain Bytes demo preview" 
                loading="lazy" 
                className="w-full h-auto object-cover" 
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
              <div className="rounded-3xl overflow-hidden bg-black/5 border border-primary/10 shadow-lg">
                <img 
                  src="/lovable-uploads/b20e6ad1-c463-49d2-840e-0936dfe78118.png" 
                  alt="Brain Bytes demo preview" 
                  loading="lazy" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </Card>

            {/* Primary CTA */}
            <div className="text-center">
              <Button 
                onClick={() => setIsWaitlistOpen(true)}
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center">
                  <div>Join the Waitlist</div>
                  <div className="text-xs opacity-90">Be first to get your AI toolkit</div>
                </div>
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
              <h3 className="text-sm font-semibold text-foreground text-center">Your Curated AI Toolkit</h3>
              
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
                onClick={() => setIsWaitlistOpen(true)}
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center">
                  <div>Join the Waitlist</div>
                  <div className="text-xs opacity-90">Be first to get your AI toolkit</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Features - Desktop Only */}
        <div className="hidden md:block mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">How Brain Bytes works in 2 minutes</h2>
            <p className="text-muted-foreground">Three simple steps to transform your productivity</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group p-6 text-center bg-gradient-to-br from-primary-light to-accent-light border-primary/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Answer 3 quick questions</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Get instantly matched with your ideal AI setup—zero fluff, just fast results.
                </p>
              </div>
            </Card>

            <Card className="group p-6 text-center bg-gradient-to-br from-accent-light to-success-light border-accent/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-success text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-accent transition-colors duration-300">Get your starter kit</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Receive a curated set of AI tools and guides tailored to your specific needs.
                </p>
              </div>
            </Card>

            <Card className="group p-6 text-center bg-gradient-to-br from-success-light to-primary-light border-success/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-success transition-colors duration-300">Start saving time</h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Begin using AI effectively with confidence and clear guidance.
                </p>
              </div>
            </Card>
          </div>

          {/* Testimonials Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Trusted by productive professionals</h2>
              <p className="text-muted-foreground">See what early users are saying about Brain Bytes</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="group p-6 bg-gradient-to-br from-white to-primary-light/20 border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      <span>★★★★★</span>
                    </div>
                  </div>
                  <blockquote className="text-foreground italic mb-4 text-lg leading-relaxed group-hover:text-primary transition-colors duration-300">
                    "Brain Bytes transformed my daily routine. I'm saving 2+ hours every day and finally feel in control of my schedule."
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold mr-3">
                      SM
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Sarah M.</div>
                      <div className="text-sm text-muted-foreground">Marketing Director</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="group p-6 bg-gradient-to-br from-white to-accent-light/20 border-accent/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      <span>★★★★★</span>
                    </div>
                  </div>
                  <blockquote className="text-foreground italic mb-4 text-lg leading-relaxed group-hover:text-accent transition-colors duration-300">
                    "The personalized AI insights are incredible. It's like having a productivity coach that actually understands my workflow."
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-success rounded-full flex items-center justify-center text-white font-bold mr-3">
                      DL
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">David L.</div>
                      <div className="text-sm text-muted-foreground">Software Engineer</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* CTA Section - Desktop Only */}
          <div className="mt-12 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Ready to get your own curated AI toolkit?
              </h2>
              <p className="text-muted-foreground">
                Join the waitlist and be first to access your personalized productivity system.
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              <Button 
                onClick={() => setIsWaitlistOpen(true)}
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="text-center">
                  <div>Join the Waitlist</div>
                  <div className="text-sm opacity-90">Be first to get your AI toolkit</div>
                </div>
              </Button>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="text-primary">✓</span>
                  <span>One-time $29 fee</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-primary">✓</span>
                  <span>No subscriptions</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-primary">✓</span>
                  <span>100% personalized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <WaitlistSignup 
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
};

export default Demo;
