"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, badgeVariant } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { api } from "@/lib/api";
import { ReportRecord, PaginatedMeta } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ page: 1, limit: 20, total: 0, hasMore: false });
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resolveReport, setResolveReport] = useState<ReportRecord | null>(null);
  const [resolution, setResolution] = useState<"resolved" | "dismissed" | "escalated">("resolved");
  const [notes, setNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = (page = 1) => {
    setLoading(true);
    api.get<{ reports: ReportRecord[]; meta: PaginatedMeta }>("/admin/reports", {
      page, limit: 20, status: statusFilter !== "all" ? statusFilter : undefined,
    })
      .then((res) => { setReports(res?.reports || []); setMeta(res?.meta || { page: 1, limit: 20, total: 0, hasMore: false }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const handleResolve = async () => {
    if (!resolveReport) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/reports/${resolveReport.id}/resolve`, { resolution, notes, actionTaken });
      setResolveReport(null);
      fetchReports(meta.page);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Review and manage user reports.</p>
      </div>

      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="reviewed">Reviewed</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports found" description="No reports match the current filter." />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={badgeVariant(report.status)}>{report.status}</Badge>
                      <span className="text-sm font-medium">{report.reason}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(report.createdAt)}</span>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    )}
                    {report.actionTaken && (
                      <p className="text-xs text-muted-foreground">Action: {report.actionTaken}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setResolveReport(report)}>
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={(page) => fetchReports(page)} />

      <Dialog open={!!resolveReport} onOpenChange={() => setResolveReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Report</DialogTitle>
            <DialogDescription>Take action on this report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select value={resolution} onValueChange={(v: "resolved" | "dismissed" | "escalated") => setResolution(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolved"><CheckCircle className="h-4 w-4 mr-2 inline" /> Resolved</SelectItem>
                  <SelectItem value="dismissed"><XCircle className="h-4 w-4 mr-2 inline" /> Dismissed</SelectItem>
                  <SelectItem value="escalated"><ArrowUp className="h-4 w-4 mr-2 inline" /> Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action Taken (optional)</Label>
              <Textarea placeholder="e.g., Warned user, suspended account..." value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Internal notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveReport(null)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
