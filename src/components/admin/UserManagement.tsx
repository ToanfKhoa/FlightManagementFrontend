import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Users, Eye, Edit, Trash, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { User, UsersPageResponse } from "../../types/authType";
import type { ApiResponse } from "../../types/commonType";
import type { Passenger } from "../../types/passengerType";
import type { Employee } from "../../types/employeeType";
import { userService } from "../../services/userService";
import { passengerService } from "../../services/passengerService";
import { employeeService } from "../../services/employeeService";
import UserFormDialog from "./UserFormDialog";
import { useEffect } from "react";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const handleDeleteUser = async (userId: number) => {
    try {
      setLoading(true);
      const res: ApiResponse<any> = await userService.deleteUser(userId);
      const ok = res && (res.code === 0 || res.code === 200 || String(res.message).toLowerCase().includes('success'));
      if (ok) {
        // Refresh current page after delete
        try {
          if (users.length === 1 && page > 0) {
            setPage(prev => prev - 1);
            // when set page, useEffect auto fetchUsers
          } else {
            fetchUsers();
          }

        } catch (err) {
          // fallback: remove locally
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        }

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
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const fetchUserDetails = async (user: User) => {
    setSelectedUser(user);
    setSelectedPassenger(null);
    setSelectedEmployee(null);
    setShowDetailDialog(true);

    const passengerId = (user as any).passenger_id;
    const employeeId = (user as any).employee_id;

    if (passengerId) {
      try {
        const res = await passengerService.getPassenger(String(passengerId));
        if (res?.data) {
          setSelectedPassenger(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch passenger details:', err);
      }
    }

    if (employeeId) {
      try {
        const res = await employeeService.getEmployee(String(employeeId));
        if (res?.data) {
          setSelectedEmployee(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch employee details:', err);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers({
        page: page,
        size: size,
        search: debouncedSearch,
        role: selectedRole === "ALL" ? "" : selectedRole,
        sort: "updatedAt,desc"
      });

      // Set data
      if (res?.data) {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err: any) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to first page on new search
    }, 500); // delay 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [page, size, debouncedSearch, selectedRole]);

  return (
    <div className="space-y-6">
      <div>
        <h2>Quản lý tài khoản</h2>
        <p className="text-sm text-gray-600 mt-1">Danh sách người dùng hệ thống</p>
      </div>
      <UserFormDialog
        open={showEditDialog}
        onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditUser(null); }}
        initial={editUser ?? undefined}
        mode="edit"
        onUpdated={(u: User) => setUsers(prev => prev.map(p => p.id === u.id ? u : p))}
      />

      {/* Search */}
      <div className="flex gap-2 items-center mb-4">
        <Input
          placeholder="Tìm kiếm theo username..."
          value={searchTerm} // Bind vào searchTerm
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Dropdown Role mới */}
        <select
          className="border p-2 rounded"
          value={selectedRole}
          onChange={(e) => { setSelectedRole(e.target.value); setPage(0); }}
        >
          <option value="">Tất cả</option>
          <option value="PASSENGER">hành khách</option>
          <option value="EMPLOYEE">nhân viên</option>
          <option value="ADMIN">quản trị viên</option>
        </select>

        <Button onClick={() => setShowCreateDialog(true)}>Tạo mới</Button>
        <UserFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreated={(u: User) => { setPage(0); /* refresh first page to include new */ }} />
      </div>

      {/* User List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-gray-500">Không tìm thấy tài khoản nào</p>
        ) : (
          users.map(user => (
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
                  <Button size="sm" variant="outline" onClick={() => fetchUserDetails(user)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Xem
                  </Button>

                  {/* Edit */}
                  <Button size="sm" variant="outline" onClick={() => { setEditUser(user); setShowEditDialog(true); }}>
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>

                  {/* Delete */}
                  <Button size="sm" variant="destructive" onClick={() => confirmDeleteUser(user)}>
                    <Trash className="w-4 h-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Trang {page + 1} / {totalPages || 1}</div>
        <div className="flex gap-2">
          <Button disabled={page <= 0 || loading} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</Button>
          <Button disabled={page >= (totalPages - 1) || loading} onClick={() => setPage(p => Math.min((totalPages - 1) || p + 1, p + 1))}>Next</Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{userToDelete?.username}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setUserToDelete(null); }}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(userToDelete?.id ?? 0)}
                className="flex-1"
              >
                Xác nhận xóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={(open) => { setShowDetailDialog(open); if (!open) { setSelectedUser(null); setSelectedPassenger(null); setSelectedEmployee(null); } }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Thông tin tài khoản</DialogTitle>
            <DialogDescription>Chi tiết tài khoản {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info */}
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold text-base">Thông tin tài khoản</h3>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                {selectedUser && (selectedUser as any).passenger_id && <p><strong>Passenger ID:</strong> {(selectedUser as any).passenger_id}</p>}
                {selectedUser && (selectedUser as any).employee_id && <p><strong>Employee ID:</strong> {(selectedUser as any).employee_id}</p>}
                <p><strong>Created at:</strong> {new Date((selectedUser as any).createdAt ?? (selectedUser as any).created_at ?? '').toLocaleString()}</p>
                <p><strong>Updated at:</strong> {new Date((selectedUser as any).updatedAt ?? (selectedUser as any).updated_at ?? '').toLocaleString()}</p>
              </div>

              {/* Passenger Info */}
              {selectedPassenger && (
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-base">Thông tin hành khách</h3>
                  <p><strong>Họ tên:</strong> {selectedPassenger.fullName}</p>
                  <p><strong>Ngày sinh:</strong> {new Date(selectedPassenger.dateOfBirth).toLocaleDateString()}</p>
                  <p><strong>Quốc tịch:</strong> {selectedPassenger.nationality}</p>
                  <p><strong>Số CMND/CCCD:</strong> {selectedPassenger.idNumber}</p>
                  <p><strong>Địa chỉ:</strong> {selectedPassenger.address}</p>
                  <p><strong>Số điện thoại:</strong> {selectedPassenger.phone}</p>
                </div>
              )}

              {/* Employee Info */}
              {selectedEmployee && (
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-base">Thông tin nhân viên</h3>
                  <p><strong>Họ tên:</strong> {selectedEmployee.fullName}</p>
                  <p><strong>Vị trí:</strong> {selectedEmployee.position}</p>
                  <p><strong>Kinh nghiệm làm việc:</strong> {selectedEmployee.workExperience}</p>
                  <p><strong>Tổng giờ bay:</strong> {selectedEmployee.totalFlightHours}</p>
                  <p><strong>Giờ bay tháng này:</strong> {selectedEmployee.monthlyHours}</p>
                  <p><strong>Giờ bay tối đa:</strong> {selectedEmployee.maxHours}</p>
                  <p><strong>Phân công:</strong> {selectedEmployee.assignments?.join(', ') || 'Không có'}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
