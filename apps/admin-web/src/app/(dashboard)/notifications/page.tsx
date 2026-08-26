"use client";

import { useState, useEffect } from "react";
import { Bell, Send, Eye, MousePointerClick, XCircle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";
import { Loading } from "@/components/shared/loading";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface NotificationAnalytics {
  period: string;
  summary: {
    total: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    deliveryRate: string;
    openRate: string;
    clickRate: string;
  };
  byType: Array<{ type: string; count: number; delivered: number; opened: number; clicked: number }>;
  byChannel: Array<{ channel: string; count: number; delivered: number }>;
  byPlatform: Array<{ platform: string; count: number; delivered: number }>;
  daily: Array<{ date: string; total: number; delivered: number; opened: number; clicked: number; failed: number }>;
}

interface NotificationRecord {
  id: string;
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  channel: string;
  platform: string;
  status: string;
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
  deliveredAt: string;
  openedAt: string;
  clickedAt: string;
  failureReason: string;
  createdAt: string;
}

interface NotificationHistoryResponse {
  notifications: NotificationRecord[];
  meta: { page: number; limit: number; total: number; hasMore: boolean };
}

export default function NotificationHistoryPage() {
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, hasMore: false });
  const [period, setPeriod] = useState("30d");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<NotificationAnalytics>("/admin/notification-analytics", { period })
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    setHistoryLoading(true);
    const params: Record<string, string> = { page: String(meta.page), limit: String(meta.limit) };
    if (typeFilter !== "all") params.type = typeFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    if (channelFilter !== "all") params.channel = channelFilter;
    api.get<NotificationHistoryResponse>("/admin/notification-history", params)
      .then((res) => {
        setHistory(res.notifications || []);
        setMeta(res.meta);
      })
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [period, typeFilter, statusFilter, channelFilter, meta.page]);

  const statusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <Loading text="Loading notification analytics..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notification History</h1>
            <p className="text-muted-foreground">Delivery tracking, open rates, and click analytics.</p>
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
        <StatCard title="Total Sent" value={analytics?.summary.total ?? 0} icon={Send} />
        <StatCard title="Delivered" value={analytics?.summary.delivered ?? 0} icon={Eye} description={`${analytics?.summary.deliveryRate ?? 0}% rate`} />
        <StatCard title="Opened" value={analytics?.summary.opened ?? 0} icon={MousePointerClick} description={`${analytics?.summary.openRate ?? 0}% rate`} />
        <StatCard title="Failed" value={analytics?.summary.failed ?? 0} icon={XCircle} />
      </div>

      <Card>
        <CardHeader><CardTitle>Daily Notification Volume</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="delivered" fill="#22c55e" name="Delivered" />
                <Bar dataKey="opened" fill="#3b82f6" name="Opened" />
                <Bar dataKey="clicked" fill="#a855f7" name="Clicked" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>By Notification Type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.byType ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="type" type="category" className="text-xs" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" name="Total" />
                  <Bar dataKey="opened" fill="#3b82f6" name="Opened" />
                  <Bar dataKey="clicked" fill="#a855f7" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>By Channel</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.byChannel ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="channel" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" name="Total" />
                  <Bar dataKey="delivered" fill="#22c55e" name="Delivered" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Delivery Log</CardTitle>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setMeta(m => ({ ...m, page: 1 })); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="like">Like</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={v => { setChannelFilter(v); setMeta(m => ({ ...m, page: 1 })); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setMeta(m => ({ ...m, page: 1 })); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Loading text="Loading history..." />
          ) : history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No notifications found.</p>
          ) : (
            <div className="space-y-3">
              {history.map((n) => (
                <div key={n.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{n.title}</p>
                      <Badge className={statusColor(n.status)}>{n.status}</Badge>
                      {n.opened && <Badge variant="outline" className="text-blue-600">Opened</Badge>}
                      {n.clicked && <Badge variant="outline" className="text-purple-600">Clicked</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{n.body}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Type: {n.type}</span>
                      <span>Channel: {n.channel || "—"}</span>
                      <span>Platform: {n.platform || "—"}</span>
                      <span>Sent: {formatDate(n.createdAt)}</span>
                      {n.deliveredAt && <span>Delivered: {formatDate(n.deliveredAt)}</span>}
                      {n.openedAt && <span>Opened: {formatDate(n.openedAt)}</span>}
                      {n.failureReason && <span className="text-red-500">Error: {n.failureReason}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {meta.hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setMeta(m => ({ ...m, page: m.page + 1 }))}
                className="text-sm text-primary hover:underline"
              >
                Load more ({meta.total - meta.page * meta.limit} remaining)
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
