"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Heart, Users, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MatchAnalyticsData {
  period: string;
  totalMatches: number;
  totalLikes: number;
  matchRate: string;
  totalUsers: number;
  dataPoints: Array<{ date: string; matches: number; likes: number }>;
}

export default function MatchAnalyticsPage() {
  const [data, setData] = useState<MatchAnalyticsData | null>(null);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<MatchAnalyticsData>("/admin/match-analytics", { period })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <Loading text="Loading match analytics..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Match Analytics</h1>
            <p className="text-muted-foreground">Match rates, likes, and engagement metrics.</p>
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

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Matches" value={data?.totalMatches ?? 0} icon={Users} />
        <StatCard title="Total Likes" value={data?.totalLikes ?? 0} icon={Heart} />
        <StatCard title="Match Rate" value={data?.matchRate ?? "0%"} icon={Percent} />
        <StatCard title="Total Users" value={data?.totalUsers ?? 0} icon={Users} />
      </div>

      <Card>
        <CardHeader><CardTitle>Matches & Likes Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dataPoints ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} name="Likes" dot={false} />
                <Line type="monotone" dataKey="matches" stroke="#22c55e" strokeWidth={2} name="Matches" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
