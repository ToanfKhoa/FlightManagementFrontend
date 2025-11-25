import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Users, Eye, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import type { UserAccount } from "../../lib/mockData";
import { mockUserAccounts } from "../../lib/mockData";

export function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>(mockUserAccounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success("Đã xóa tài khoản");
  };

  // Lọc theo username
  const filteredUsers = users.filter(u =>
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
                      user.role === "admin" ? "destructive" :
                      user.role === "employee" ? "default" : "secondary"
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
                          {selectedUser.passenger_id && <p><strong>Passenger ID:</strong> {selectedUser.passenger_id}</p>}
                          {selectedUser.employee_id && <p><strong>Employee ID:</strong> {selectedUser.employee_id}</p>}
                          <p><strong>Created at:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
                          <p><strong>Updated at:</strong> {new Date(selectedUser.updated_at).toLocaleString()}</p>
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
