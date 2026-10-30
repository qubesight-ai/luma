import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Bell, Clock, Volume2, Palette, RotateCcw, AlertCircle, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppState, UserProgress } from "@/hooks/useAppState";
import { useDemoMode } from "@/hooks/useDemoMode";

export default function Settings() {
  const navigate = useNavigate();
  const { userProgress, setUserProgress } = useAppState();
  const { isDemoUser } = useDemoMode();
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      dailyGoal: userProgress.goalMinutes,
      soundEffects: true,
      notifications: true,
      reminderTime: "09:00",
      theme: "system",
    };
  });

  const [selectedLevel, setSelectedLevel] = useState<UserProgress['currentLevel']>(userProgress.currentLevel);

  const handleSave = () => {
    if (isDemoUser) {
      toast({
        title: "Demo mode",
        description: "Settings cannot be changed in demo mode.",
        variant: "destructive",
      });
      return;
    }
    // Save settings to localStorage
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Update global app state with new level
    setUserProgress({ 
      currentLevel: selectedLevel,
      goalMinutes: settings.dailyGoal 
    });
    
    toast({
      title: "Settings saved",
      description: `Level updated to ${selectedLevel}. Your preferences have been saved.`,
    });
  };

  const handleReset = () => {
    const defaultSettings = {
      dailyGoal: 20,
      soundEffects: true,
      notifications: true,
      reminderTime: "09:00",
      theme: "system",
    };
    setSettings(defaultSettings);
    setSelectedLevel("A2");
    toast({
      title: "Settings reset",
      description: "Default values have been restored",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-4xl mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button & Title */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-foreground hover:bg-white/95 shadow-sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-primary" />
              Back to Dashboard
            </Button>
            
            <h1 className="font-display font-bold text-3xl text-foreground text-shadow-sm">
              Settings
            </h1>
            <p className="text-muted-foreground font-medium">
              Customize your learning experience
            </p>
          </div>

          {/* Profile Section */}
          <Card className="mb-6 aero-card rounded-3xl overflow-hidden shadow-aqua">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary shadow-sm">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground">Profile</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current level</Label>
                  <p className="text-xs text-muted-foreground mb-2 mt-0.5">
                    Your current level: <span className="font-bold text-primary">{userProgress.currentLevel}</span>
                  </p>
                  <Select 
                    value={selectedLevel} 
                    onValueChange={(value: UserProgress['currentLevel']) => setSelectedLevel(value)}
                  >
                    <SelectTrigger className="mt-2 rounded-full bg-white/80 border-white/90 shadow-sm h-11">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/80 bg-white/95 backdrop-blur-md">
                      <SelectItem value="A1">A1 - Beginner</SelectItem>
                      <SelectItem value="A2">A2 - Elementary</SelectItem>
                      <SelectItem value="B1">B1 - Intermediate</SelectItem>
                      <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                      <SelectItem value="C1">C1 - Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedLevel !== userProgress.currentLevel && (
                    <p className="text-xs font-semibold text-amber-600 mt-2">
                      ⚠️ You will change from {userProgress.currentLevel} to {selectedLevel}. Save to apply.
                    </p>
                  )}
                </div>
              </div>

              {/* Error History Link */}
              <div className="mt-6 pt-6 border-t border-white/60">
                <Button 
                  variant="outline" 
                  className="w-full justify-between btn-gel-white rounded-full font-semibold text-xs px-5 h-11"
                  onClick={() => navigate("/error-history")}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Error History</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <p className="text-xs text-muted-foreground font-medium mt-2">
                  Review your errors to improve your learning
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Goals Section */}
          <Card className="mb-6 aero-card rounded-3xl overflow-hidden shadow-aqua">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary shadow-sm">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground">Goals</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daily study goal</Label>
                    <span className="pill-bubble-aqua text-xs font-extrabold px-3 py-1">{settings.dailyGoal} min</span>
                  </div>
                  <Slider
                    value={[settings.dailyGoal]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, dailyGoal: value[0] }))}
                    min={5}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground mt-2">
                    <span>5 min</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="mb-6 aero-card rounded-3xl overflow-hidden shadow-aqua">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary shadow-sm">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-bold text-sm text-foreground">Daily reminders</Label>
                    <p className="text-xs text-muted-foreground font-medium">Receive a reminder to study</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
                
                {settings.notifications && (
                  <div className="pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reminder time</Label>
                    <Select 
                      value={settings.reminderTime} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, reminderTime: value }))}
                    >
                      <SelectTrigger className="mt-2 rounded-full bg-white/80 border-white/90 shadow-sm h-11">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/80 bg-white/95 backdrop-blur-md">
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sound Section */}
          <Card className="mb-6 aero-card rounded-3xl overflow-hidden shadow-aqua">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary shadow-sm">
                  <Volume2 className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground">Sound</h2>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-bold text-sm text-foreground">Sound effects</Label>
                  <p className="text-xs text-muted-foreground font-medium">Sounds when completing exercises</p>
                </div>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEffects: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card className="mb-6 aero-card rounded-3xl overflow-hidden shadow-aqua">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-100 border border-white flex items-center justify-center text-primary shadow-sm">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground">Appearance</h2>
              </div>
              
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger className="mt-2 rounded-full bg-white/80 border-white/90 shadow-sm h-11">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/80 bg-white/95 backdrop-blur-md">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 btn-gel-white rounded-full font-bold text-sm py-6"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2 text-primary" />
              Reset
            </Button>
            <Button
              variant="hero"
              className="flex-1 btn-gel-aqua rounded-full font-bold text-sm py-6 text-white shadow-aqua-sm"
              onClick={handleSave}
            >
              Save changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
