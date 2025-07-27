import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  User,
  Clock,
  Save,
  ExternalLink,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SystemSettingsSection = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleResetPlan = () => {
    toast({
      title: "Plan reset",
      description: "Your productivity plan has been reset. You can create a new one.",
    });
  };

  const handleSignOut = () => {
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
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
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl"
              onClick={handleResetPlan}
            >
              <Clock className="w-4 h-4 mr-2" />
              Reset Productivity Plan
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Legal & Support */}
      <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <ExternalLink className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Legal & Support</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl text-sm"
              onClick={() => window.open('/privacy-policy', '_blank')}
            >
              Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl text-sm"
              onClick={() => window.open('/terms-of-service', '_blank')}
            >
              Terms of Service
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl text-sm"
              onClick={() => window.open('/refund-policy', '_blank')}
            >
              Refund Policy
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl text-sm"
              onClick={() => window.open('/cookie-policy', '_blank')}
            >
              Cookie Policy
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-xl text-sm md:col-span-2"
              onClick={() => window.open('/contact', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Contact Support
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

      {/* Subtle Branding */}
      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground/60">Brain Bytes • 2025</p>
      </div>
    </div>
  );
};