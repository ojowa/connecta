"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, User, MessageSquare } from "lucide-react";
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
import { PaginatedMeta } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface AppealRecord {
  id: string;
  userId: string;
  reason: string;
  description: string | null;
  evidenceUrls: string[] | null;
  status: string;
  decision: string | null;
  decisionNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user?: { id: string; email: string; fullName: string; phone: string; status: string } | null;
}

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<AppealRecord[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ page: 1, limit: 20, total: 0, hasMore: false });
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reviewAppeal, setReviewAppeal] = useState<AppealRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppeals = (page = 1) => {
    setLoading(true);
    api.get<{ appeals: AppealRecord[]; meta: PaginatedMeta }>("/admin/appeals", {
      page, limit: 20, status: statusFilter !== "all" ? statusFilter : undefined,
    })
      .then((res) => { setAppeals(res?.appeals || []); setMeta(res?.meta || { page: 1, limit: 20, total: 0, hasMore: false }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppeals(); }, [statusFilter]);

  const handleReview = async (decision: "approved" | "rejected") => {
    if (!reviewAppeal) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/appeals/${reviewAppeal.id}/review`, { decision, notes });
      setReviewAppeal(null);
      setNotes("");
      fetchAppeals(meta.page);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appeals Center</h1>
        <p className="text-muted-foreground">Review user ban/suspension appeals with one-click actions.</p>
      </div>

      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="reviewed">Reviewed</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <Loading />
      ) : appeals.length === 0 ? (
        <EmptyState title="No appeals found" description="No appeals match the current filter." />
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => (
            <Card key={appeal.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={badgeVariant(appeal.status)}>{appeal.status}</Badge>
                      {appeal.decision && (
                        <Badge className={appeal.decision === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {appeal.decision}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(appeal.createdAt)}</span>
                    </div>
                    {appeal.user && (
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{appeal.user.fullName || appeal.user.email}</span>
                        <span className="text-xs text-muted-foreground">({appeal.user.email})</span>
                        <Badge className={appeal.user.status === "active" ? "bg-green-100 text-green-800" : appeal.user.status === "banned" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                          {appeal.user.status}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{appeal.reason}</span>
                    </div>
                    {appeal.description && (
                      <p className="text-sm text-muted-foreground mb-2">{appeal.description}</p>
                    )}
                    {appeal.decisionNotes && (
                      <p className="text-xs text-muted-foreground">Admin notes: {appeal.decisionNotes}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {appeal.status === "pending" && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => { setReviewAppeal(appeal); setNotes(""); }}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { setReviewAppeal(appeal); setNotes("Rejected by admin"); }}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {appeal.status === "reviewed" && (
                      <Button variant="outline" size="sm" onClick={() => { setReviewAppeal(appeal); setNotes(appeal.decisionNotes || ""); }}>
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={(page) => fetchAppeals(page)} />

      <Dialog open={!!reviewAppeal} onOpenChange={() => setReviewAppeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
            <DialogDescription>Approve to reinstate the user, or reject with notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {reviewAppeal?.user && (
              <div className="text-sm">
                <span className="font-medium">User:</span> {reviewAppeal.user.fullName || reviewAppeal.user.email} ({reviewAppeal.user.email})
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Reason:</span> {reviewAppeal?.reason}
            </div>
            {reviewAppeal?.description && (
              <div className="text-sm">
                <span className="font-medium">Details:</span> {reviewAppeal.description}
              </div>
            )}
            <div className="space-y-2">
              <Label>Admin Notes (optional)</Label>
              <Textarea placeholder="Add notes about this decision..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewAppeal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleReview("rejected")} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Reject"}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleReview("approved")} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Approve & Reinstate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
