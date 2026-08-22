"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";
import { SystemSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<{ settings: SystemSettings }>("/admin/settings")
      .then((res) => setSettings(res.settings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await api.put<{ updatedAt: string }>("/admin/settings", settings);
      setMessage("Settings saved successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SystemSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <Loading text="Loading settings..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage platform settings.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {message && (
        <div className={`rounded-lg border p-4 text-sm ${message.includes("success") ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic platform configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <input type="checkbox" id="maintenance" checked={!!settings.maintenanceMode} onChange={(e) => update("maintenanceMode", e.target.checked)} className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcome">Welcome Message</Label>
              <Input id="welcome" value={settings.welcomeMessage || ""} onChange={(e) => update("welcomeMessage", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAge">Min Age</Label>
                <Input id="minAge" type="number" value={settings.minAge || 18} onChange={(e) => update("minAge", parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAge">Max Age</Label>
                <Input id="maxAge" type="number" value={settings.maxAge || 100} onChange={(e) => update("maxAge", parseInt(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Toggle platform features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="video">Video Calls</Label>
              <input type="checkbox" id="video" checked={!!settings.enableVideoCalls} onChange={(e) => update("enableVideoCalls", e.target.checked)} className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="voice">Voice Calls</Label>
              <input type="checkbox" id="voice" checked={!!settings.enableVoiceCalls} onChange={(e) => update("enableVoiceCalls", e.target.checked)} className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="superlikes">Super Likes</Label>
              <input type="checkbox" id="superlikes" checked={!!settings.enableSuperLikes} onChange={(e) => update("enableSuperLikes", e.target.checked)} className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSuper">Max Free Super Likes</Label>
              <Input id="maxSuper" type="number" value={settings.maxFreeSuperLikes || 5} onChange={(e) => update("maxFreeSuperLikes", parseInt(e.target.value))} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
