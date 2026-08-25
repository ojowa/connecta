"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, badgeVariant } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { api } from "@/lib/api";
import { UserRecord, PaginatedMeta } from "@/types";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ page: 1, limit: 20, total: 0, hasMore: false });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = (page = 1) => {
    setLoading(true);
    api.get<{ users: UserRecord[]; meta: PaginatedMeta }>("/admin/users", { page, limit: 20, search, status })
      .then((res) => { setUsers(res?.users || []); setMeta(res?.meta || { page: 1, limit: 20, total: 0, hasMore: false }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = () => fetchUsers(1);
  const handleSuspend = async (userId: string) => {
    if (!confirm("Suspend this user?")) return;
    try {
      await api.post(`/admin/users/${userId}/suspend`, { reason: "other", description: "Suspended from admin panel" });
      fetchUsers(meta.page);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleBan = async (userId: string) => {
    if (!confirm("Ban this user permanently?")) return;
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason: "other", description: "Banned from admin panel" });
      fetchUsers(meta.page);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/unsuspend`);
      fetchUsers(meta.page);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage platform users.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setTimeout(() => fetchUsers(1), 0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <Loading />
          ) : users.length === 0 ? (
            <EmptyState title="No users found" description="Try adjusting your search or filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium">{user.fullName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={badgeVariant(user.status)}>{user.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/users/${user.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {user.status === "active" ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600" onClick={() => handleSuspend(user.id)}>
                                <Ban className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleBan(user.id)}>
                                <Ban className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleUnsuspend(user.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination meta={meta} onPageChange={fetchUsers} />
    </div>
  );
}
