import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Users, Eye, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import type { User, ApiResponse, UsersPageResponse } from "../../types/authType";
import { userService } from "../../services/userService";
import { useEffect } from "react";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      setLoading(true);
      const res: ApiResponse<any> = await userService.deleteUser(userId);
      const ok = res && (res.code === 0 || res.code === 200 || String(res.message).toLowerCase().includes('success'));
      if (ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success("Đã xóa tài khoản");
      } else {
        console.warn('Delete user unexpected response:', res);
        toast.error('Xóa tài khoản thất bại');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Xóa tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res: ApiResponse<UsersPageResponse> = await userService.getAllUsers();
        // Extract users array from paginated response
        const items = res?.data?.content ?? [];
        if (mounted) setUsers(items as User[]);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Không thể tải danh sách người dùng");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Lọc theo username
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2>Quản lý tài khoản</h2>
        <p className="text-sm text-gray-600 mt-1">Danh sách người dùng hệ thống</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Tìm kiếm theo username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={() => setSearchQuery("")}>Clear</Button>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500">Không tìm thấy tài khoản nào</p>
        ) : (
          filteredUsers.map(user => (
            <Card key={user.id}>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {user.username}
                    <Badge variant={
                      String(user.role).toLowerCase() === "admin" ? "destructive" :
                      String(user.role).toLowerCase() === "employee" || String(user.role).toLowerCase() === "staff" ? "default" : "secondary"
                    }>
                      {user.role}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Email: {user.email} | Phone: {user.phone}
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  {/* View Details */}
                  <Dialog open={showDetailDialog && selectedUser?.id === user.id} onOpenChange={setShowDetailDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thông tin tài khoản</DialogTitle>
                        <DialogDescription>Chi tiết tài khoản {user.username}</DialogDescription>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-2 text-sm">
                          <p><strong>Username:</strong> {selectedUser.username}</p>
                          <p><strong>Email:</strong> {selectedUser.email}</p>
                          <p><strong>Phone:</strong> {selectedUser.phone}</p>
                          <p><strong>Role:</strong> {selectedUser.role}</p>
                          {selectedUser && (selectedUser as any).passenger_id && <p><strong>Passenger ID:</strong> {(selectedUser as any).passenger_id}</p>}
                          {selectedUser && (selectedUser as any).employee_id && <p><strong>Employee ID:</strong> {(selectedUser as any).employee_id}</p>}
                          <p><strong>Created at:</strong> {new Date((selectedUser as any).createdAt ?? (selectedUser as any).created_at ?? '').toLocaleString()}</p>
                          <p><strong>Updated at:</strong> {new Date((selectedUser as any).updatedAt ?? (selectedUser as any).updated_at ?? '').toLocaleString()}</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Edit */}
                  <Button size="sm" variant="outline" onClick={() => toast.info("Chức năng sửa chưa triển khai")}>
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>

                  {/* Delete */}
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                    <Trash className="w-4 h-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
