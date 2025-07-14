"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !profile?.is_admin) {
      router.push("/");
    }
  }, [profile, isLoading, router]);

  useEffect(() => {
    if (profile?.is_admin) {
      fetchReports();
    }
    // eslint-disable-next-line
  }, [profile]);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reports");
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
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!commentId) return;
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "comment", id: commentId, action: "remove" })
    });
    fetchReports();
  };

  const handleBanUser = async (userId: string) => {
    if (!userId) return;
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "user", id: userId, action: "ban" })
    });
    fetchReports();
  };

  if (isLoading || !profile?.is_admin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Dashboard - Reported Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive">{error}</Alert>}
          {loading ? (
            <div>Loading reports...</div>
          ) : reports.length === 0 ? (
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
                  <TableHead>Reported At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.comment?.content || report.comment_content || "[Deleted]"}</TableCell>
                    <TableCell>{report.reporter?.full_name || report.reporter?.username || report.reporter_id || "[Unknown]"}</TableCell>
                    <TableCell>{report.reported_user?.full_name || report.reported_user?.username || report.reported_user_id || "[Unknown]"}</TableCell>
                    <TableCell>{report.reason || "[No reason]"}</TableCell>
                    <TableCell>{report.status || "[No status]"}</TableCell>
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
