"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";
import { DashboardMetrics } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<DashboardMetrics>("/admin/dashboard", { period })
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <Loading text="Loading dashboard..." />;
  if (!metrics) return <p className="text-muted-foreground">Failed to load dashboard.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and key metrics.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Users" value={metrics.users.total} icon={Users} />
        <StatCard title="Revenue" value={metrics.revenue.totalRevenueNgn} format="currency" icon={DollarSign} description={`${metrics.revenue.activeSubscriptions} active subscriptions`} />
        <StatCard title="Reports" value={metrics.safety.totalReports} icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: "Users", value: metrics.users.total },
                { name: "Revenue", value: metrics.revenue.totalRevenueNgn },
                { name: "Reports", value: metrics.safety.totalReports },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(346, 78%, 53%)" strokeWidth={2} dot={{ fill: "hsl(346, 78%, 53%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(metrics.revenue.totalRevenueNgn)}</p>
            <p className="text-sm text-muted-foreground mt-1">{metrics.revenue.activeSubscriptions.toLocaleString()} active subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.safety.totalReports}</p>
            <p className="text-sm text-muted-foreground mt-1">Total reports filed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
