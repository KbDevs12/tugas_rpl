"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Pencil, Trash2, Users, Mail, Plus } from "lucide-react";
import UserForm from "./user-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type User = {
  id: string;
  name: string;
  role: "owner" | "kasir";
  is_active: boolean;
  created_at: string;
  auth_users?: {
    email: string;
  };
};

export default function UserClient({ data }: { data: User[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    try {
      const { error: publicError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (publicError) throw publicError;

      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) {
        console.warn("Could not delete auth user:", authError);
      }

      toast.success("User berhasil dihapus");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pengguna yang dapat mengakses sistem
          </p>
        </div>
        <Button
          variant={"default"}
          onClick={() => {
            setEditUser(null);
            setIsOpenForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Tambah User
        </Button>
        <UserForm
          mode={editUser ? "update" : "create"}
          user={editUser}
          open={isOpenForm || !!editUser}
          onClose={() => {
            setEditUser(null);
            setIsOpenForm(false);
          }}
        />
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada user</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mulai dengan menambahkan user pertama Anda
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {user.auth_users?.email || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "owner" ? "default" : "secondary"}
                    >
                      {user.role === "owner" ? "Owner" : "Kasir"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditUser(user);
                          setIsOpenForm(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. User akan dihapus secara
              permanen dari sistem dan tidak bisa login lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
