"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TeacherEmail {
  id: string;
  email: string;
  addedAt: string;
  addedBy: { name: string | null; email: string };
}

export default function AdminUsersPage() {
  const [teacherEmails, setTeacherEmails] = useState<TeacherEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  const fetchTeacherEmails = async () => {
    try {
      const res = await fetch("/api/admin/teacher-emails");
      const data = await res.json();
      setTeacherEmails(Array.isArray(data.teacherEmails) ? data.teacherEmails : []);
    } catch {
      setTeacherEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherEmails();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    setAdding(true);
    try {
      const res = await fetch("/api/admin/teacher-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Xatolik yuz berdi");
        return;
      }
      setNewEmail("");
      toast.success("O'qituvchi emaili qo'shildi");
      await fetchTeacherEmails();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (email: string) => {
    setDeletingEmail(email);
    try {
      const res = await fetch(`/api/admin/teacher-emails/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Xatolik yuz berdi");
        return;
      }
      toast.success("O'qituvchi emaili o'chirildi");
      await fetchTeacherEmails();
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Foydalanuvchilarni boshqarish</h1>
        <p className="text-muted-foreground">
          O&apos;qituvchi sifatida tizimga kirishi kerak bo&apos;lgan emaillarni belgilang
        </p>
      </div>

      {/* Teacher Emails Section */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">O&apos;qituvchi emaillar</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Quyidagi emaillar bilan tizimga kirgan foydalanuvchilar avtomatik o&apos;qituvchi sifatida belgilanadi.
          Agar foydalanuvchi avval talaba sifatida ro&apos;yxatdan o&apos;tgan bo&apos;lsa, keyingi kirishida o&apos;qituvchiga o&apos;zgartiriladi.
        </p>

        {/* Add form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            type="email"
            placeholder="teacher@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1"
            disabled={adding}
          />
          <Button type="submit" disabled={adding || !newEmail.trim()}>
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Qo&apos;shish
          </Button>
        </form>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : teacherEmails.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center">
            <UserCheck className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              Hali o&apos;qituvchi emaillar qo&apos;shilmagan
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {teacherEmails.map((te) => (
              <div
                key={te.id}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{te.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Qo&apos;shdi: {te.addedBy.name ?? te.addedBy.email} ·{" "}
                    {new Date(te.addedAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    O&apos;qituvchi
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(te.email)}
                    disabled={deletingEmail === te.email}
                  >
                    {deletingEmail === te.email ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
