// Settings.jsx
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Sun, Moon } from "lucide-react";

const THEME_FALLBACK = "light";

export default function SettingsPage() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [theme, setTheme] = useState(THEME_FALLBACK);

  const [userProfile, setUserProfile] = useState({
    preferred_name: "",
    email: "",
    backup_email: ""
  });

  // Theme: read current and subscribe to changes
  useEffect(() => {
    const getCurrentTheme = () =>
      (window.AuraTheme && typeof window.AuraTheme.get === "function"
        ? window.AuraTheme.get()
        : null) ||
      document.documentElement.getAttribute("data-theme") ||
      THEME_FALLBACK;

    // initialize
    setTheme(getCurrentTheme());

    // subscribe via AuraTheme if available
    let unsub = null;
    if (window.AuraTheme && typeof window.AuraTheme.subscribe === "function") {
      unsub = window.AuraTheme.subscribe((t) => setTheme(t));
    }

    // also listen for a custom event as a backup
    const onThemeChangeEvent = (e) => {
      const next = e?.detail?.theme || getCurrentTheme();
      setTheme(next);
    };
    window.addEventListener("themechange", onThemeChangeEvent);

    return () => {
      if (typeof unsub === "function") unsub();
      window.removeEventListener("themechange", onThemeChangeEvent);
    };
  }, []);

  // Load user profile
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const currentUser = await User.me();
        if (!alive) return;
        setUser(currentUser);
        setUserProfile({
          preferred_name: currentUser.preferred_name || currentUser.full_name || "",
          email: currentUser.email || "",
          backup_email: currentUser.backup_email || ""
        });
      } catch (err) {
        console.error("Failed to load user data:", err);
        toast.error("Could not load your settings.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Theme helpers
  const applyThemeLocally = (next) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    root.classList.toggle("theme-dark", next === "dark");
    root.classList.toggle("theme-light", next === "light");
    try {
      localStorage.setItem("aul_theme", next);
    } catch {}
  };

  const setThemeViaLayout = (next) => {
    // If Layout provided a global API, use it
    if (window.AuraTheme && typeof window.AuraTheme.set === "function") {
      window.AuraTheme.set(next);
      // Optimistically update local state so the button text changes immediately
      setTheme(next);
      toast.success(`Theme set to ${next === "dark" ? "Dark" : "Light"}.`);
      return;
    }

    // Fallback: apply directly here
    applyThemeLocally(next);
    setTheme(next);
    try {
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    } catch {}
    toast.success(`Theme set to ${next === "dark" ? "Dark" : "Light"}.`);
  };

  const toggleTheme = () => setThemeViaLayout(theme === "dark" ? "light" : "dark");

  // Save profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await User.updateMyUserData({
        preferred_name: userProfile.preferred_name?.trim() || null,
        email: userProfile.email?.trim() || null,
        backup_email: userProfile.backup_email?.trim() || null
      });

      if (result.success) {
        // Update local user state
        setUser((prev) => ({
          ...prev,
          preferred_name: userProfile.preferred_name?.trim() || null,
          email: userProfile.email?.trim() || null,
          backup_email: userProfile.backup_email?.trim() || null
        }));

        // Refresh the auth context to update the header
        refreshUser();

        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/80">Configure your profile and appearance.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 max-w-6xl mx-auto space-y-6"
      >
        {/* Appearance */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={toggleTheme}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/15"
              >
                {theme === "light" ? "Switch to Dark" : "Switch to Light"}
              </Button>
              <span className="text-white/70 text-sm">
                Current theme: <strong>{theme}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setThemeViaLayout("light")}
                className={`rounded-xl p-4 border transition-all ${
                  theme === "light" ? "border-white/60 bg-white/10" : "border-white/20 hover:bg-white/5"
                } text-white text-left`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span className="font-medium">Light</span>
                </div>
                <p className="text-xs text-white/70 mt-1">Original AuraLink look</p>
              </button>

              <button
                type="button"
                onClick={() => setThemeViaLayout("dark")}
                className={`rounded-xl p-4 border transition-all ${
                  theme === "dark" ? "border-white/60 bg-white/10" : "border-white/20 hover:bg-white/5"
                } text-white text-left`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span className="font-medium">Dark</span>
                </div>
                <p className="text-xs text-white/70 mt-1">Glassy dashboard style</p>
              </button>
            </div>

            <div className="text-white/70 text-xs">Your choice is saved on this device.</div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Preferred Name</Label>
                <Input
                  value={userProfile.preferred_name}
                  onChange={(e) => setUserProfile((p) => ({ ...p, preferred_name: e.target.value }))}
                  placeholder="Enter your preferred name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <p className="text-white/60 text-xs">This is how you will be addressed throughout the app</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Email Address</Label>
                <Input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Enter your email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Backup Email Address (Optional)</Label>
              <Input
                type="email"
                value={userProfile.backup_email}
                onChange={(e) => setUserProfile((p) => ({ ...p, backup_email: e.target.value }))}
                placeholder="Enter a backup email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <p className="text-white/60 text-sm">Used for account recovery and important notifications</p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}