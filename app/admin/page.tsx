"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // SDG category keywords
  const SDG_CATEGORIES = [
    { label: "SDG 5: Gender-based", value: "sexism" },
    { label: "SDG 16: Violence/Threats", value: "threat" },
    { label: "Hate Speech", value: "hate_speech" },
    { label: "Harassment", value: "harassment" },
    { label: "Offensive", value: "offensive" },
    { label: "Profanity", value: "profanity" },
    { label: "Spam", value: "spam" },
  ];

  useEffect(() => {
    if (!isLoading && !profile?.is_admin) {
      router.push("/");
    }
  }, [profile, isLoading, router]);

  useEffect(() => {
    if (profile?.is_admin) {
      fetchReports();
    }
  }, [profile]);

  // Memoize filtered reports to prevent unnecessary re-renders
  const filteredReports = useMemo(() => {
    const filtered = reports.filter((report: any) => {
      let matches = true;
      if (flaggedOnly) {
        matches = matches && (report.comment?.moderation_status === "flagged");
      }
      if (categoryFilter) {
        const categories = report.comment?.categories || report.prediction?.categories || [];
        matches = matches && categories.includes(categoryFilter);
      }
      return matches;
    });

    return filtered;
  }, [reports, flaggedOnly, categoryFilter]);

  const fetchReports = useCallback(async () => {
    // Prevent multiple simultaneous requests
    const now = Date.now();
    if (now - lastFetch < 1000) return; // Debounce requests
    
    setLoading(true);
    setError("");
    setLastFetch(now);
    
    try {
      const res = await fetch("/api/admin/reports", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();
      if (res.ok) {
  
        setReports(data);
      } else {
        setError(data.error || "Failed to fetch reports");
      }
    } catch (err) {
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  const handleDeleteComment = useCallback(async (commentId: number) => {
    if (!commentId) return;
    try {
      await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "comment", id: commentId, action: "remove" })
      });
      fetchReports();
    } catch (err) {
      setError("Failed to delete comment");
    }
  }, [fetchReports]);

  const handleBanUser = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "user", id: userId, action: "ban" })
      });
      fetchReports();
    } catch (err) {
      setError("Failed to ban user");
    }
  }, [fetchReports]);



  if (isLoading || !profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Admin Dashboard - Reported Comments</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push("/feed")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to System
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchReports}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={flaggedOnly} onChange={e => setFlaggedOnly(e.target.checked)} />
              Show only flagged
            </label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {SDG_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={() => { setFlaggedOnly(false); setCategoryFilter(""); }}>Reset Filters</Button>
          </div>
          {error && <Alert variant="destructive">{error}</Alert>}
          <div className="mb-4 text-sm text-gray-600">
            Total reports: {reports.length} | Filtered reports: {filteredReports.length}
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner text="Loading reports..." />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-gray-500">No reported comments.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comment</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Reported At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.comment?.content || report.comment_content || "[No content]"}</TableCell>
                    <TableCell>{report.reporter?.full_name || report.reporter?.username || report.reporter_id || "[Unknown]"}</TableCell>
                    <TableCell>{report.reported_user?.full_name || report.reported_user?.username || report.reported_user_id || "[Unknown]"}</TableCell>
                    <TableCell>{report.reason || "[No reason]"}</TableCell>
                    <TableCell>{report.status || "[No status]"}</TableCell>
                    <TableCell>
                      {(report.comment?.categories || report.prediction?.categories || []).map((cat: string) => (
                        <Badge key={cat} variant="secondary" className="mr-1">{cat}</Badge>
                      ))}
                    </TableCell>
                    <TableCell>{report.created_at ? new Date(report.created_at).toLocaleString() : "[No date]"}</TableCell>
                    <TableCell>
                      {report.comment_id && (
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteComment(report.comment_id)}>
                          Delete Comment
                        </Button>
                      )}
                      {report.reported_user_id && (
                        <Button size="sm" variant="outline" className="ml-2" onClick={() => handleBanUser(report.reported_user_id)}>
                          Ban User
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
