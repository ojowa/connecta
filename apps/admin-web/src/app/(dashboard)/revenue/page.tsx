"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, AlertTriangle, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueData {
  period: string;
  totalRevenue: number;
  periodRevenue: number;
  failedRevenue: number;
  failedTransactions: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  currency: string;
  dataPoints: Array<{ date: string; revenue: number; failed: number }>;
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<RevenueData>("/admin/revenue-deep-dive", { period })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <Loading text="Loading revenue data..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Revenue</h1>
            <p className="text-muted-foreground">Subscription metrics, payments, and revenue trends.</p>
          </div>
        </div>
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

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Total Revenue" value={formatCurrency(data?.totalRevenue ?? 0)} icon={DollarSign} />
        <StatCard title="Period Revenue" value={formatCurrency(data?.periodRevenue ?? 0)} icon={TrendingUp} />
        <StatCard title="Failed Revenue" value={formatCurrency(data?.failedRevenue ?? 0)} icon={AlertTriangle} description={`${data?.failedTransactions ?? 0} failed transactions`} />
        <StatCard title="Active Subscriptions" value={data?.activeSubscriptions ?? 0} icon={CreditCard} />
        <StatCard title="Total Subscriptions" value={data?.totalSubscriptions ?? 0} icon={CreditCard} />
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue vs Failed (Daily)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dataPoints ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
