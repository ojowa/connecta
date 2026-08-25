"use client";

import { useState, useEffect } from "react";
import { Server, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/shared/loading";
import { api } from "@/lib/api";

interface SystemHealth {
  services: Array<{ name: string; port: number; status: string; statusCode: number }>;
  summary: { total: number; healthy: number; degraded: number; down: number };
}

export default function SystemPage() {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.get<SystemHealth>("/admin/system-health")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading && !data) return <Loading text="Checking system health..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">System Health</h1>
            <p className="text-muted-foreground">Status of all microservices.</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div><p className="text-3xl font-bold">{data?.summary.healthy ?? 0}</p><p className="text-sm text-muted-foreground">Healthy</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div><p className="text-3xl font-bold">{data?.summary.degraded ?? 0}</p><p className="text-sm text-muted-foreground">Degraded</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div><p className="text-3xl font-bold">{data?.summary.down ?? 0}</p><p className="text-sm text-muted-foreground">Down</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Service Status</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.services?.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${s.status === 'healthy' ? 'bg-green-500' : s.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Port {s.port}</p>
                  </div>
                </div>
                <Badge variant={s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'destructive'}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
