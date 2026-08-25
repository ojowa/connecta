"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, setAccessToken, AdminUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [requires2fa, setRequires2fa] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post<{ admin?: AdminUser; tokens?: { accessToken: string }; requires2fa?: boolean; tempToken?: string }>(
        "/admin/login",
        { email, password }
      );

      if (res.requires2fa) {
        setRequires2fa(true);
        setTempToken(res.tempToken || "");
        return;
      }

      if (res.tokens?.accessToken) {
        setAccessToken(res.tokens.accessToken);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handle2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post<{ admin?: AdminUser; tokens?: { accessToken: string } }>(
        "/admin/2fa/verify",
        { code: twoFaCode, tempToken }
      );

      if (res.tokens?.accessToken) {
        setAccessToken(res.tokens.accessToken);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Flame className="h-8 w-8" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">OJChat Admin</CardTitle>
            <CardDescription>Sign in to the admin panel</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!requires2fa ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ojchat.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2fa} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="2fa">Two-Factor Code</Label>
                <Input
                  id="2fa"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setRequires2fa(false); setError(""); }}>
                Back to login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
