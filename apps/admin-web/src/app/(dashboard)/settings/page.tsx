"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CreditCard, Key, Eye, EyeOff, Database, Globe } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"paystack" | "flutterwave">("paystack");
  const [storageTab, setStorageTab] = useState<"local" | "s3" | "r2">("local");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const CURRENCIES = [
    { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "GHS", label: "Ghanaian Cedi", symbol: "GH₵" },
    { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
    { code: "ZAR", label: "South African Rand", symbol: "R" },
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "BRL", label: "Brazilian Real", symbol: "R$" },
    { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  ];

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.label.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.includes(currencySearch)
  );

  const selectedCurrency = CURRENCIES.find((c) => c.code === (settings.currency || "NGN"));

  useEffect(() => {
    api.get<{ settings: SystemSettings }>("/admin/settings")
      .then((res) => setSettings(res?.settings || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.put<{ updatedAt: string }>("/admin/settings", settings);
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

  const updateNested = (parent: keyof SystemSettings, key: string, value: unknown) => {
    setSettings((prev) => {
      const current = (prev[parent] as Record<string, unknown>) || {};
      return { ...prev, [parent]: { ...current, [key]: value } };
    });
  };

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) return <Loading text="Loading settings..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage platform settings and payment configuration.</p>
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
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Platform Currency
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span>{selectedCurrency ? `${selectedCurrency.symbol} ${selectedCurrency.code} — ${selectedCurrency.label}` : "Select currency"}</span>
                  <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {currencyOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="p-2">
                      <input
                        placeholder="Search currency..."
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filteredCurrencies.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No currency found.</div>
                      )}
                      {filteredCurrencies.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            update("currency", c.code);
                            setCurrencyOpen(false);
                            setCurrencySearch("");
                          }}
                          className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                            (settings.currency || "NGN") === c.code ? "bg-accent text-accent-foreground font-medium" : ""
                          }`}
                        >
                          <span className="font-mono text-xs w-6 text-center">{c.symbol}</span>
                          <span className="font-medium">{c.code}</span>
                          <span className="text-muted-foreground">{c.label}</span>
                          {(settings.currency || "NGN") === c.code && (
                            <svg className="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {currencyOpen && (
                <div className="fixed inset-0 z-40" onClick={() => { setCurrencyOpen(false); setCurrencySearch(""); }} />
              )}
              <p className="text-xs text-muted-foreground">Used for plan pricing display and payment processing.</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Platforms
          </CardTitle>
          <CardDescription>Configure payment gateway API keys. Keys are stored securely in the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Active Payment Platform</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentPlatform"
                  value="paystack"
                  checked={settings.paymentPlatform === "paystack" || !settings.paymentPlatform}
                  onChange={(e) => update("paymentPlatform", e.target.value)}
                  className="h-4 w-4"
                />
                <span className="font-medium">Paystack</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentPlatform"
                  value="flutterwave"
                  checked={settings.paymentPlatform === "flutterwave"}
                  onChange={(e) => update("paymentPlatform", e.target.value)}
                  className="h-4 w-4"
                />
                <span className="font-medium">Flutterwave</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("paystack")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "paystack"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Paystack
            </button>
            <button
              onClick={() => setActiveTab("flutterwave")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "flutterwave"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Flutterwave
            </button>
          </div>

          {activeTab === "paystack" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="paystack-secret" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Secret Key
                </Label>
                <div className="relative">
                  <Input
                    id="paystack-secret"
                    type={showSecrets["paystack-secret"] ? "text" : "password"}
                    placeholder="sk_test_..."
                    value={settings.paystack?.secretKey || ""}
                    onChange={(e) => updateNested("paystack", "secretKey", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("paystack-secret")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecrets["paystack-secret"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack-public" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Public Key
                </Label>
                <Input
                  id="paystack-public"
                  type={showSecrets["paystack-public"] ? "text" : "password"}
                  placeholder="pk_test_..."
                  value={settings.paystack?.publicKey || ""}
                  onChange={(e) => updateNested("paystack", "publicKey", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack-webhook" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Webhook Secret
                </Label>
                <Input
                  id="paystack-webhook"
                  type={showSecrets["paystack-webhook"] ? "text" : "password"}
                  placeholder="whsec_..."
                  value={settings.paystack?.webhookSecret || ""}
                  onChange={(e) => updateNested("paystack", "webhookSecret", e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "flutterwave" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="flutterwave-secret" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Secret Key
                </Label>
                <div className="relative">
                  <Input
                    id="flutterwave-secret"
                    type={showSecrets["flutterwave-secret"] ? "text" : "password"}
                    placeholder="FLWSECK-..."
                    value={settings.flutterwave?.secretKey || ""}
                    onChange={(e) => updateNested("flutterwave", "secretKey", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("flutterwave-secret")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecrets["flutterwave-secret"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flutterwave-public" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Public Key
                </Label>
                <Input
                  id="flutterwave-public"
                  type={showSecrets["flutterwave-public"] ? "text" : "password"}
                  placeholder="FLWPUBK-..."
                  value={settings.flutterwave?.publicKey || ""}
                  onChange={(e) => updateNested("flutterwave", "publicKey", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flutterwave-webhook" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Webhook Secret
                </Label>
                <Input
                  id="flutterwave-webhook"
                  type={showSecrets["flutterwave-webhook"] ? "text" : "password"}
                  placeholder="FLWSECK-..."
                  value={settings.flutterwave?.webhookSecret || ""}
                  onChange={(e) => updateNested("flutterwave", "webhookSecret", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Provider
          </CardTitle>
          <CardDescription>Configure where media files (photos, videos) are stored.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Active Storage Provider</Label>
            <div className="flex gap-4">
              {(["local", "s3", "r2"] as const).map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="storageProvider"
                    value={p}
                    checked={settings.storageProvider === p || (!settings.storageProvider && p === "local")}
                    onChange={(e) => update("storageProvider", e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">{p === "s3" ? "AWS S3" : p === "r2" ? "Cloudflare R2" : "Local Disk"}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 border-b">
            <button onClick={() => setStorageTab("local")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${storageTab === "local" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              Local Disk
            </button>
            <button onClick={() => setStorageTab("s3")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${storageTab === "s3" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              AWS S3
            </button>
            <button onClick={() => setStorageTab("r2")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${storageTab === "r2" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              Cloudflare R2
            </button>
          </div>

          {storageTab === "local" && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Files are stored on the server filesystem. Best for development and small-scale deployments.</p>
              <div className="space-y-2">
                <Label htmlFor="local-baseUrl">Base URL</Label>
                <Input id="local-baseUrl" placeholder="http://localhost:3006/media/files" value={settings.storageLocal?.baseUrl || ""} onChange={(e) => updateNested("storageLocal", "baseUrl", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="local-uploadDir">Upload Directory</Label>
                <Input id="local-uploadDir" placeholder="/data/uploads (optional)" value={settings.storageLocal?.uploadDir || ""} onChange={(e) => updateNested("storageLocal", "uploadDir", e.target.value)} />
              </div>
            </div>
          )}

          {storageTab === "s3" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="s3-region">Region</Label>
                <Input id="s3-region" placeholder="us-east-1" value={settings.storageS3?.region || ""} onChange={(e) => updateNested("storageS3", "region", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3-bucket">Bucket Name</Label>
                <Input id="s3-bucket" placeholder="my-bucket" value={settings.storageS3?.bucket || ""} onChange={(e) => updateNested("storageS3", "bucket", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3-accessKey" className="flex items-center gap-2"><Key className="h-4 w-4" />Access Key ID</Label>
                <Input id="s3-accessKey" type={showSecrets["s3-accessKey"] ? "text" : "password"} placeholder="AKIA..." value={settings.storageS3?.accessKeyId || ""} onChange={(e) => updateNested("storageS3", "accessKeyId", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3-secretKey" className="flex items-center gap-2"><Key className="h-4 w-4" />Secret Access Key</Label>
                <div className="relative">
                  <Input id="s3-secretKey" type={showSecrets["s3-secretKey"] ? "text" : "password"} placeholder="wJalr..." value={settings.storageS3?.secretAccessKey || ""} onChange={(e) => updateNested("storageS3", "secretAccessKey", e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => toggleSecret("s3-secretKey")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSecrets["s3-secretKey"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3-endpoint">Custom Endpoint (optional)</Label>
                <Input id="s3-endpoint" placeholder="For MinIO or S3-compatible services" value={settings.storageS3?.endpoint || ""} onChange={(e) => updateNested("storageS3", "endpoint", e.target.value)} />
              </div>
            </div>
          )}

          {storageTab === "r2" && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Cloudflare R2 is S3-compatible with free egress. Best for production.</p>
              <div className="space-y-2">
                <Label htmlFor="r2-accountId">Account ID</Label>
                <Input id="r2-accountId" placeholder="your-cloudflare-account-id" value={settings.storageR2?.accountId || ""} onChange={(e) => updateNested("storageR2", "accountId", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r2-bucket">Bucket Name</Label>
                <Input id="r2-bucket" placeholder="my-media-bucket" value={settings.storageR2?.bucket || ""} onChange={(e) => updateNested("storageR2", "bucket", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r2-accessKey" className="flex items-center gap-2"><Key className="h-4 w-4" />Access Key ID</Label>
                <Input id="r2-accessKey" type={showSecrets["r2-accessKey"] ? "text" : "password"} value={settings.storageR2?.accessKeyId || ""} onChange={(e) => updateNested("storageR2", "accessKeyId", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r2-secretKey" className="flex items-center gap-2"><Key className="h-4 w-4" />Secret Access Key</Label>
                <div className="relative">
                  <Input id="r2-secretKey" type={showSecrets["r2-secretKey"] ? "text" : "password"} value={settings.storageR2?.secretAccessKey || ""} onChange={(e) => updateNested("storageR2", "secretAccessKey", e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => toggleSecret("r2-secretKey")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSecrets["r2-secretKey"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="r2-publicUrl">Public URL (optional)</Label>
                <Input id="r2-publicUrl" placeholder="https://pub-xxx.r2.dev" value={settings.storageR2?.publicUrl || ""} onChange={(e) => updateNested("storageR2", "publicUrl", e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
