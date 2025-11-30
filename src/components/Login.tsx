import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Plane, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { User, UserRole } from "../App";
import { authService } from "../services/authService";
import type { LoginResponse } from "../types/authType";

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: () => void;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("passenger");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = (await authService.login(email, password)) as LoginResponse;

      // Store response for axios interceptors (expected shape: { token, user })
      localStorage.setItem("user", JSON.stringify({ token: response.token, user: response.user }));

      // Map API user (LoginResponse.user) to frontend `User` used in App.tsx
      const apiUser = response.user;
      // Map backend role (likely uppercase in `authType`) to app lowercase role
      const roleMap: Record<string, UserRole> = {
        PASSENGER: "passenger",
        STAFF: "staff",
        ADMIN: "admin",
        CREW: "crew",
        PILOT: "crew",
      };
      const mappedRole = (roleMap[apiUser.role as string] ?? (apiUser.role as unknown as UserRole)) as UserRole;

      const user: User = {
        id: String(apiUser.id),
        name: apiUser.fullName ?? apiUser.email,
        email: apiUser.email,
        role: mappedRole,
      };

      toast.success(`Đăng nhập thành công (${user.name})`);
      onLogin(user);
    } catch (error: any) {
      // Axios errors often hold `error.response.data.message` or similar
      const msg = error?.response?.message || error?.message || "Đăng nhập thất bại";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: UserRole) => {
    const roleNames: Record<string, string> = {
      passenger: "Nguyễn Văn A",
      crew: "Trần Văn B",
      staff: "Nhân viên",
      admin: "Quản trị viên",
    };
    
    const user: User = {
      id: role === "crew" ? "c1" : "demo-" + role,
      name: roleNames[role || "passenger"],
      email: `${role}@example.com`,
      role,
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Plane className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>Hệ Thống Quản Lý Chuyến Bay</CardTitle>
          <CardDescription>Đăng nhập để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email / Tên đăng nhập</Label>
              <Input
                id="email"
                type="email"
                  placeholder="email@example.com hoặc tên đăng nhập"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <select
                id="role"
                className="w-full px-3 py-2 border rounded-md"
                value={selectedRole || ""}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              >
                <option value="passenger">Hành khách</option>
                <option value="crew">Phi hành viên</option>
                <option value="staff">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </form>

          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={onRegister}>
              <UserPlus className="w-4 h-4 mr-2" />
              Đăng ký tài khoản hành khách
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-gray-600 mb-3">Đăng nhập nhanh:</p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("passenger")}
              >
                Hành khách
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("crew")}
              >
                Phi viên
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("staff")}
              >
                Nhân viên
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("admin")}
              >
                Quản trị
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}