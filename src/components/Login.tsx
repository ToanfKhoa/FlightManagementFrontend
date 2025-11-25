import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Plane, UserPlus } from "lucide-react";
import type { User, UserRole } from "../App";

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: () => void;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("passenger");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - in real app, this would call an API
    const user: User = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
      role: selectedRole,
    };
    
    onLogin(user);
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
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