import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Calendar, 
  Mail, 
  Bell, 
  User,
  Clock,
  Save,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GoogleCalendarSection } from "./GoogleCalendarSection";

export const SystemSettingsSection = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [focusReminders, setFocusReminders] = useState(true);
  const [email, setEmail] = useState("");
  const [isEmailOptedIn, setIsEmailOptedIn] = useState(false);
  const { toast } = useToast();

  const handleEmailOptIn = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsEmailOptedIn(true);
    setDailySummary(true);
    toast({
      title: "Email summary enabled!",
      description: "You'll receive your first daily summary tomorrow morning.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Settings className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
      </div>

      {/* Google Calendar Integration */}
      <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
        <GoogleCalendarSection />
      </Card>

      {/* Email Summary Settings */}
      <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Daily Email Summary</h3>
          </div>

          {!isEmailOptedIn ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get a daily email with your calendar events, productivity tips, and focus reminders.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 rounded-xl border-2 border-border focus:border-primary"
                />
                <Button 
                  onClick={handleEmailOptIn}
                  className="rounded-xl px-6"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enable Summary
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-foreground">Daily summaries enabled</span>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll receive daily emails at 7:00 AM with your schedule and productivity insights.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive important updates via email</p>
              </div>
              <Switch 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Daily Summary Emails</Label>
                <p className="text-xs text-muted-foreground">Morning productivity reports and tips</p>
              </div>
              <Switch 
                checked={dailySummary}
                onCheckedChange={setDailySummary}
                disabled={!isEmailOptedIn}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Focus Reminders</Label>
                <p className="text-xs text-muted-foreground">Gentle nudges to stay on track</p>
              </div>
              <Switch 
                checked={focusReminders}
                onCheckedChange={setFocusReminders}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Account & Privacy</h3>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <ExternalLink className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <Clock className="w-4 h-4 mr-2" />
              Reset Productivity Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          className="rounded-xl px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};