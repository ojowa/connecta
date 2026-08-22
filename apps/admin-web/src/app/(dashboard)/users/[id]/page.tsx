"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, UserCheck, UserX, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariant } from "@/components/ui/badge";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";
import { UserRecord } from "@/types";
import { formatDate } from "@/lib/utils";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.get<{ user: UserRecord }>(`/admin/users/${id}`)
      .then((res) => setUser(res.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSuspend = async () => {
    if (!confirm("Suspend this user?")) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/suspend`, { reason: "other", description: "Suspended from admin panel" });
      setUser((prev) => prev ? { ...prev, status: "suspended" } : null);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleBan = async () => {
    if (!confirm("Ban this user permanently?")) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/ban`, { reason: "other", description: "Banned from admin panel", permanent: true });
      setUser((prev) => prev ? { ...prev, status: "banned" } : null);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleUnsuspend = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/unsuspend`);
      setUser((prev) => prev ? { ...prev, status: "active" } : null);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  if (loading) return <Loading text="Loading user..." />;
  if (!user) return <p className="text-muted-foreground">User not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.fullName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Badge className={`ml-auto ${badgeVariant(user.status)}`}>{user.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phone}</span>
              </div>
            )}
            {user.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(user.dateOfBirth)} ({user.gender || "—"})</span>
              </div>
            )}
            {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {user.subscription ? (
              <div className="space-y-2">
                <Badge className="border border-current">{user.subscription.status}</Badge>
                <p className="text-sm text-muted-foreground">Plan: {user.subscription.planId}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscription</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {user.status === "active" ? (
              <>
                <Button variant="outline" onClick={handleSuspend} disabled={actionLoading}>
                  <UserX className="h-4 w-4 mr-2" /> Suspend
                </Button>
                <Button variant="destructive" onClick={handleBan} disabled={actionLoading}>
                  <Ban className="h-4 w-4 mr-2" /> Ban
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleUnsuspend} disabled={actionLoading}>
                <UserCheck className="h-4 w-4 mr-2" /> Reactivate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
