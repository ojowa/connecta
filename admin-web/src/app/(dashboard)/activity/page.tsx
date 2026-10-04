"use client";

import { useState, useEffect } from "react";
import { Activity, Heart, MessageCircle, Users, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface LiveActivity {
  counts: {
    likes5min: number;
    matches1h: number;
    messages1h: number;
    activeSessions: number;
    reports24h: number;
    newUsers24h: number;
  };
  recentMatches: Array<{
    id: string;
    matchedAt: string;
    user1: { id: string; fullName: string } | null;
    user2: { id: string; fullName: string } | null;
  }>;
}

export default function ActivityPage() {
  const [data, setData] = useState<LiveActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = () => {
    setLoading(true);
    api.get<LiveActivity>("/admin/live-activity")
      .then(setData)
      .catch(console.error)
      .finally(() => { setLoading(false); setLastRefresh(new Date()); });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return <Loading text="Loading activity..." />;

  const stats = [
    { label: "Likes (5min)", value: data?.counts.likes5min ?? 0, icon: Heart, color: "text-pink-500" },
    { label: "Matches (1hr)", value: data?.counts.matches1h ?? 0, icon: Users, color: "text-green-500" },
    { label: "Messages (1hr)", value: data?.counts.messages1h ?? 0, icon: MessageCircle, color: "text-blue-500" },
    { label: "Active Sessions", value: data?.counts.activeSessions ?? 0, icon: Activity, color: "text-purple-500" },
    { label: "Reports (24h)", value: data?.counts.reports24h ?? 0, icon: AlertTriangle, color: "text-orange-500" },
    { label: "New Users (24h)", value: data?.counts.newUsers24h ?? 0, icon: Users, color: "text-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Live Activity</h1>
            <p className="text-muted-foreground">Real-time platform activity. Auto-refreshes every 30s.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Last: {lastRefresh.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Matches</CardTitle></CardHeader>
        <CardContent>
          {!data?.recentMatches?.length ? (
            <p className="text-muted-foreground text-sm">No recent matches</p>
          ) : (
            <div className="space-y-3">
              {data.recentMatches.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {m.user1?.fullName || "?"} & {m.user2?.fullName || "?"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(m.matchedAt)}</p>
                    </div>
                  </div>
                  <Badge variant="outline">New Match</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
