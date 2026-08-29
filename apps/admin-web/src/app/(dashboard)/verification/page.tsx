"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, XCircle, Clock, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { api } from "@/lib/api";

interface VerificationRequest {
  id: string;
  userId: string;
  selfieUrl: string;
  status: "pending" | "approved" | "rejected";
  faceWidth: number | null;
  faceHeight: number | null;
  faceConfidence: number | null;
  livenessScore: number | null;
  imageWidth: number | null;
  imageHeight: number | null;
  fileSize: number | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string } | null;
  profilePhotos: string[];
}

interface VerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function VerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false });
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewTarget, setReviewTarget] = useState<VerificationRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved");
  const [rejectReason, setRejectReason] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchRequests = (page = 1) => {
    setLoading(true);
    api.get<{ requests: VerificationRequest[]; meta: typeof meta }>("/admin/verification", {
      page, limit: 20, status: statusFilter || undefined,
    })
      .then((res) => {
        const m = res?.meta || { page: 1, limit: 20, total: 0, totalPages: 0 };
        setRequests(res?.requests || []);
        setMeta({ ...m, hasMore: m.page < m.totalPages });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    api.get<VerificationStats>("/admin/verification/stats").then(setStats).catch(console.error);
  };

  useEffect(() => { fetchRequests(); fetchStats(); }, [statusFilter]);

  const handleReview = async () => {
    if (!reviewTarget) return;
    setReviewLoading(true);
    try {
      await api.post(`/admin/verification/${reviewTarget.id}/review`, {
        action: reviewAction,
        reason: reviewAction === "rejected" ? rejectReason : undefined,
      });
      setReviewTarget(null);
      setRejectReason("");
      fetchRequests(meta.page);
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" /> Verification Review
        </h1>
        <p className="text-muted-foreground">Review selfie verification requests and approve/reject profiles.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent></Card>
        </div>
      )}

      <div className="flex gap-3">
        {["", "pending", "approved", "rejected"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {loading ? <Loading /> : requests.length === 0 ? (
        <EmptyState title="No requests" description="No verification requests found." />
      ) : (
        <>
          <div className="grid gap-4">
            {requests.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={r.selfieUrl}
                        alt="Selfie"
                        className="h-24 w-24 rounded-lg object-cover cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedPhoto(r.selfieUrl)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{r.user?.fullName || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{r.user?.email}</span>
                        <Badge variant={statusColor(r.status) as any}>{r.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                        {r.faceConfidence && <span>Face: {(r.faceConfidence * 100).toFixed(0)}%</span>}
                        {r.livenessScore && <span>Liveness: {(r.livenessScore * 100).toFixed(0)}%</span>}
                        <span>Size: {formatFileSize(r.fileSize)}</span>
                        {r.imageWidth && r.imageHeight && <span>{r.imageWidth}x{r.imageHeight}</span>}
                      </div>
                      {r.profilePhotos.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">Profile photos:</span>
                          <div className="flex gap-1">
                            {r.profilePhotos.slice(0, 4).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt=""
                                className="h-10 w-10 rounded object-cover cursor-pointer hover:opacity-80"
                                onClick={() => setSelectedPhoto(url)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(r.createdAt)}</span>
                        {r.reviewedAt && <span>Reviewed: {formatDate(r.reviewedAt)}</span>}
                        {r.rejectionReason && <span className="text-red-600">Reason: {r.rejectionReason}</span>}
                      </div>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => { setReviewTarget(r); setReviewAction("approved"); }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => { setReviewTarget(r); setReviewAction("rejected"); }}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={fetchRequests} />
        </>
      )}

      <Dialog open={!!reviewTarget} onOpenChange={() => { setReviewTarget(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewAction === "approved" ? "Approve" : "Reject"} Verification</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to <strong>{reviewAction}</strong> the verification request from {reviewTarget?.user?.fullName}?</p>
          {reviewAction === "rejected" && (
            <Input
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          )}
          {reviewAction === "approved" && (
            <p className="text-sm text-muted-foreground">This will grant the user a verified badge on their profile.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewTarget(null); setRejectReason(""); }}>Cancel</Button>
            <Button
              variant={reviewAction === "approved" ? "default" : "destructive"}
              onClick={handleReview}
              disabled={reviewLoading}
            >
              {reviewLoading ? "Processing..." : reviewAction === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <img src={selectedPhoto || ""} alt="Photo" className="w-full rounded-lg" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
