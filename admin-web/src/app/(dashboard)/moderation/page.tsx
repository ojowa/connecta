"use client";

import { useState } from "react";
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, Bot, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

interface ToxicityResult {
  isToxic: boolean;
  severity: string;
  score: number;
  categories: string[];
  action: string;
}

interface FakeProfileResult {
  isLikelyFake: boolean;
  riskScore: number;
  flags: string[];
  confidence: number;
}

interface ScamResult {
  riskScore: number;
  flags: string[];
  isScamSuspected: boolean;
}

export default function ModerationPage() {
  const [toxicityText, setToxicityText] = useState("");
  const [toxicityResult, setToxicityResult] = useState<ToxicityResult | null>(null);
  const [fakeProfileId, setFakeProfileId] = useState("");
  const [fakeProfileResult, setFakeProfileResult] = useState<FakeProfileResult | null>(null);
  const [scamUserId, setScamUserId] = useState("");
  const [scamResult, setScamResult] = useState<ScamResult | null>(null);
  const [loading, setLoading] = useState<"toxicity" | "fake" | "scam" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkToxicity = async () => {
    if (!toxicityText.trim()) return;
    setLoading("toxicity");
    setError(null);
    try {
      const res = await api.post<ToxicityResult>("/matching/toxicity-check", { text: toxicityText });
      setToxicityResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check toxicity");
    } finally {
      setLoading(null);
    }
  };

  const checkFakeProfile = async () => {
    if (!fakeProfileId.trim()) return;
    setLoading("fake");
    setError(null);
    try {
      const res = await api.get<FakeProfileResult>(`/matching/fake-profile-check/${fakeProfileId}`);
      setFakeProfileResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check profile");
    } finally {
      setLoading(null);
    }
  };

  const checkScam = async () => {
    if (!scamUserId.trim()) return;
    setLoading("scam");
    setError(null);
    try {
      const res = await api.get<ScamResult>(`/matching/scam-check/${scamUserId}`);
      setScamResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check scam risk");
    } finally {
      setLoading(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe": return "destructive";
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "success";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "block": return "destructive";
      case "warn": return "warning";
      default: return "success";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI Moderation</h1>
          <p className="text-muted-foreground">Toxicity detection, fake profile analysis, and scam detection</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Toxicity Check</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Analyze text for hate speech, threats, harassment, spam, profanity, or bullying.</p>
            <Textarea
              placeholder="Enter message text to analyze..."
              value={toxicityText}
              onChange={(e) => setToxicityText(e.target.value)}
              className="mb-3"
              rows={3}
            />
            <Button onClick={checkToxicity} disabled={loading === "toxicity"} className="w-full">
              {loading === "toxicity" ? "Analyzing..." : "Check Toxicity"}
            </Button>
            {toxicityResult && (
              <div className="mt-4 space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Toxic</span>
                  <Badge variant={toxicityResult.isToxic ? "destructive" : "success"}>
                    {toxicityResult.isToxic ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Severity</span>
                  <Badge variant={getSeverityColor(toxicityResult.severity) as any}>
                    {toxicityResult.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Score</span>
                  <span className="text-sm">{(toxicityResult.score * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Action</span>
                  <Badge variant={getActionColor(toxicityResult.action) as any}>
                    {toxicityResult.action}
                  </Badge>
                </div>
                {toxicityResult.categories.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Categories</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {toxicityResult.categories.map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scan className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Fake Profile Check</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Analyze a profile for fake/suspicious signals: missing photos, bot patterns, reports.</p>
            <Input
              placeholder="User ID to analyze..."
              value={fakeProfileId}
              onChange={(e) => setFakeProfileId(e.target.value)}
              className="mb-3"
            />
            <Button onClick={checkFakeProfile} disabled={loading === "fake"} className="w-full">
              {loading === "fake" ? "Analyzing..." : "Check Profile"}
            </Button>
            {fakeProfileResult && (
              <div className="mt-4 space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Likely Fake</span>
                  <Badge variant={fakeProfileResult.isLikelyFake ? "destructive" : "success"}>
                    {fakeProfileResult.isLikelyFake ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className="text-sm">{(fakeProfileResult.riskScore * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm">{(fakeProfileResult.confidence * 100).toFixed(0)}%</span>
                </div>
                {fakeProfileResult.flags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Flags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {fakeProfileResult.flags.map((flag) => (
                        <Badge key={flag} variant="outline" className="text-xs">{flag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">Scam Detection</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Analyze conversations for money requests, love bombing, sob stories, urgency patterns, and suspicious links.</p>
            <div className="flex gap-3">
              <Input
                placeholder="User ID to check conversation scam risk..."
                value={scamUserId}
                onChange={(e) => setScamUserId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={checkScam} disabled={loading === "scam"}>
                {loading === "scam" ? "Analyzing..." : "Check Scam Risk"}
              </Button>
            </div>
            {scamResult && (
              <div className="mt-4 space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scam Suspected</span>
                  <Badge variant={scamResult.isScamSuspected ? "destructive" : "success"}>
                    {scamResult.isScamSuspected ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className="text-sm">{(scamResult.riskScore * 100).toFixed(0)}%</span>
                </div>
                {scamResult.flags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Flags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scamResult.flags.map((flag) => (
                        <Badge key={flag} variant="outline" className="text-xs">{flag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {scamResult.flags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No scam indicators detected.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
