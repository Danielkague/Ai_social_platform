"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function AdminNavLink() {
  const { profile } = useAuth();
  if (!profile?.is_admin) return null;
  return (
    <Link href="/admin" className="text-blue-700 font-semibold hover:underline mr-4">
      Admin Dashboard
    </Link>
  );
} 