"use client";

import { useState, useEffect } from "react";
import { CreditCard, Search, XCircle, RotateCcw, Gift, Eye, DollarSign, TrendingUp, Users, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { Loading } from "@/components/shared/loading";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Plan { id: string; name: string; displayName: string; priceMonthly: number; currency: string; }
interface Subscription {
  id: string; userId: string; planId: string; status: string; billingPeriod: string;
  startedAt: string; currentPeriodStart: string; currentPeriodEnd: string; cancelledAt: string;
  autoRenew: boolean; plan: Plan;
  user?: { id: string; email: string; fullName: string };
}

interface SubAnalytics {
  period: string;
  summary: {
    totalActive: number; totalCancelled: number; totalRefunded: number;
    newSubscriptions: number; cancellations: number; refunds: number;
    netRevenue: number; refundAmount: number;
  };
  byPlan: Array<{ planName: string; count: number; active: number }>;
  daily: Array<{ date: string; new: number }>;
}

interface SubscriptionsResponse {
  subscriptions: Subscription[];
  meta: { page: number; limit: number; total: number; hasMore: boolean };
}

export default function SubscriptionsPage() {
  const [analytics, setAnalytics] = useState<SubAnalytics | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, hasMore: false });
  const [period, setPeriod] = useState("30d");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showGrant, setShowGrant] = useState(false);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantPlanId, setGrantPlanId] = useState("");
  const [grantDays, setGrantDays] = useState(30);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<SubAnalytics>("/admin/subscriptions/analytics", { period }),
      api.get<{ plans: Plan[] }>("/admin/subscriptions/plans"),
    ]).then(([a, p]) => {
      setAnalytics(a);
      setPlans(p.plans || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [period]);

  const loadSubs = () => {
    setSubsLoading(true);
    const params: Record<string, string> = { page: String(meta.page), limit: String(meta.limit) };
    if (statusFilter !== "all") params.status = statusFilter;
    if (search) params.search = search;
    api.get<SubscriptionsResponse>("/admin/subscriptions", params)
      .then((res) => { setSubs(res.subscriptions || []); setMeta(res.meta); })
      .catch(console.error).finally(() => setSubsLoading(false));
  };

  useEffect(() => { loadSubs(); }, [period, statusFilter, meta.page]);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this subscription?")) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/subscriptions/${id}/cancel`, { reason: "Cancelled by admin" });
      loadSubs();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleRefund = async (id: string) => {
    if (!confirm("Refund this subscription? This will return the last payment amount.")) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/subscriptions/${id}/refund`, { reason: "Refunded by admin" });
      loadSubs();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleGrant = async () => {
    if (!grantUserId || !grantPlanId) { alert("User ID and Plan are required"); return; }
    setActionLoading(true);
    try {
      await api.post("/admin/subscriptions/grant", { userId: grantUserId, planId: grantPlanId, durationDays: grantDays });
      setShowGrant(false);
      setGrantUserId(""); setGrantPlanId(""); setGrantDays(30);
      loadSubs();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-yellow-100 text-yellow-800";
      case "refunded": return "bg-red-100 text-red-800";
      case "expired": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) return <Loading text="Loading subscription data..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">Manage subscriptions, refunds, and premium grants.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowGrant(!showGrant)}>
            <Gift className="h-4 w-4 mr-2" /> Grant Premium
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showGrant && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-lg">Grant Premium</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="User ID"
                value={grantUserId}
                onChange={(e) => setGrantUserId(e.target.value)}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={grantPlanId}
                onChange={(e) => setGrantPlanId(e.target.value)}
              >
                <option value="">Select plan</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.displayName} (₦{p.priceMonthly}/mo)</option>)}
              </select>
              <input
                type="number"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Duration (days)"
                value={grantDays}
                onChange={(e) => setGrantDays(parseInt(e.target.value) || 30)}
              />
              <div className="flex gap-2">
                <Button onClick={handleGrant} disabled={actionLoading}>Grant</Button>
                <Button variant="outline" onClick={() => setShowGrant(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Active Subscriptions" value={analytics?.summary.totalActive ?? 0} icon={CreditCard} />
        <StatCard title="New This Period" value={analytics?.summary.newSubscriptions ?? 0} icon={TrendingUp} />
        <StatCard title="Net Revenue" value={formatCurrency(analytics?.summary.netRevenue ?? 0)} icon={DollarSign} />
        <StatCard title="Refunds" value={analytics?.summary.refunds ?? 0} icon={RotateCcw} description={`${formatCurrency(analytics?.summary.refundAmount ?? 0)} refunded`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Subscriptions by Plan</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.byPlan ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="planName" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" name="Total" />
                  <Bar dataKey="active" fill="#22c55e" name="Active" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>New Subscriptions (Daily)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.daily ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="new" fill="#3b82f6" name="New" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Subscriptions</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadSubs()}
                />
              </div>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setMeta(m => ({ ...m, page: 1 })); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {subsLoading ? (
            <Loading text="Loading subscriptions..." />
          ) : subs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No subscriptions found.</p>
          ) : (
            <div className="space-y-3">
              {subs.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{s.user?.fullName || s.user?.email || s.userId}</p>
                      <Badge className={statusColor(s.status)}>{s.status}</Badge>
                      {s.autoRenew && <Badge variant="outline">Auto-renew</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.plan?.displayName || s.planId} — {formatCurrency(s.plan?.priceMonthly || 0)}/mo
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Started: {formatDate(s.startedAt)}</span>
                      <span>Period ends: {formatDate(s.currentPeriodEnd)}</span>
                      {s.cancelledAt && <span>Cancelled: {formatDate(s.cancelledAt)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSub(selectedSub?.id === s.id ? null : s)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {s.status === "active" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(s.id)} disabled={actionLoading}>
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRefund(s.id)} disabled={actionLoading}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {meta.hasMore && (
            <div className="flex justify-center mt-4">
              <button onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))} className="text-sm text-primary hover:underline">
                Load more ({meta.total - meta.page * meta.limit} remaining)
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
