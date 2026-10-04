"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { api } from "@/lib/api";
import { AuditEntry, PaginatedMeta } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ page: 1, limit: 50, total: 0, hasMore: false });
  const [loading, setLoading] = useState(true);

  const fetchEntries = (page = 1) => {
    setLoading(true);
    api.get<{ auditEntries: AuditEntry[]; meta: PaginatedMeta }>("/admin/audit-log", { page, limit: 50 })
      .then((res) => { setEntries(res?.auditEntries || []); setMeta(res?.meta || { page: 1, limit: 50, total: 0, hasMore: false }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Track admin actions across the platform.</p>
      </div>

      {loading ? (
        <Loading />
      ) : entries.length === 0 ? (
        <EmptyState title="No audit entries" description="No actions have been recorded yet." icon={ClipboardList} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Admin</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Target</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Details</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">IP</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium font-mono">{entry.action}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{entry.adminId === "system" ? "System" : entry.adminId.slice(0, 8) + "..."}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {entry.targetType && <span className="font-mono">{entry.targetType}</span>}
                        {entry.targetId && <span className="ml-1 text-xs">({entry.targetId.slice(0, 8)}...)</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                        {entry.details ? JSON.stringify(entry.details) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{entry.ipAddress || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination meta={meta} onPageChange={fetchEntries} />
    </div>
  );
}
