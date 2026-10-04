"use client";

import { useState, useEffect } from "react";
import { Sparkles, Trash2, Eye, Clock, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { api } from "@/lib/api";

interface MomentRecord {
  id: string;
  userId: string;
  mediaUrl: string;
  caption: string | null;
  mediaType: string;
  expiresAt: string;
  viewCount: number;
  createdAt: string;
  expired: boolean;
  user: { id: string; fullName: string; email: string } | null;
}

interface MomentStats {
  total: number;
  active: number;
  expired: number;
  todayCount: number;
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<MomentRecord[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 0, hasMore: false });
  const [stats, setStats] = useState<MomentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MomentRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMoments = (page = 1) => {
    setLoading(true);
    api.get<{ moments: MomentRecord[]; meta: typeof meta }>("/admin/moments", {
      page, limit: 50, userId: userIdFilter || undefined,
    })
      .then((res) => {
        const m = res?.meta || { page: 1, limit: 50, total: 0, totalPages: 0 };
        setMoments(res?.moments || []);
        setMeta({ ...m, hasMore: m.page < m.totalPages });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    api.get<MomentStats>("/admin/moments/stats").then(setStats).catch(console.error);
  };

  useEffect(() => { fetchMoments(); fetchStats(); }, [userIdFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/moments/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchMoments(meta.page);
      fetchStats();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setDeleteLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" /> Moments Moderation
        </h1>
        <p className="text-muted-foreground">View and moderate user moments.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats.expired}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold text-primary">{stats.todayCount}</p>
          </CardContent></Card>
        </div>
      )}

      <div className="flex gap-3">
        <Input
          placeholder="Filter by User ID..."
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={() => { setUserIdFilter(""); }}>Clear</Button>
      </div>

      {loading ? <Loading /> : moments.length === 0 ? (
        <EmptyState title="No moments" description="No moments found." />
      ) : (
        <>
          <div className="grid gap-4">
            {moments.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {m.mediaType === 'video' ? (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : m.mediaUrl ? (
                        <img src={m.mediaUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{m.user?.fullName || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{m.user?.email}</span>
                        <Badge variant={m.expired ? "outline" : "default"}>
                          {m.expired ? "Expired" : "Active"}
                        </Badge>
                        <Badge variant="outline">{m.mediaType}</Badge>
                      </div>
                      {m.caption && <p className="text-sm text-muted-foreground mb-1">{m.caption}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {m.viewCount} views</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(m.createdAt)}</span>
                        <span>Expires: {formatDate(m.expiresAt)}</span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(m)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination
            meta={meta}
            onPageChange={fetchMoments}
          />
        </>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Moment</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this moment by {deleteTarget?.user?.fullName}? This cannot be undone.</p>
          {deleteTarget?.caption && <p className="text-sm text-muted-foreground mt-2">Caption: &quot;{deleteTarget.caption}&quot;</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
