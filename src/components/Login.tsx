import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Plane, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { User, UserRole } from "../App";
import { authService } from "../services/authService";
import type { LoginResponse } from "../types/authType";
import { RequestResetScreen } from "./passenger/RequestNewPassword";
import { SuccessScreen } from "./passenger/SuccessRequestNewPassword";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/images/logo-icon.png";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'request' | 'success'>('login');
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Đăng nhập thành công");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  // const quickLogin = (role: UserRole) => {
  //   const roleNames: Record<string, string> = {
  //     passenger: "Nguyễn Văn A",
  //     crew: "Trần Văn B",
  //     staff: "Nhân viên",
  //     admin: "Quản trị viên",
  //   };

  //   const user: User = {
  //     id: role === "crew" ? "c1" : "demo-" + role,
  //     name: roleNames[role || "passenger"],
  //     email: `${role}@example.com`,
  //     role,
  //   };
  //   onLogin(user);
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoIcon} alt="SkyWings Logo" className="w-16 h-16" />
          </div>
          <CardTitle>Hệ Thống Quản Lý Chuyến Bay</CardTitle>
          <CardDescription>Đăng nhập để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => navigate("/login", { state: { showRegister: true } })}>
              <UserPlus className="w-4 h-4 mr-2" />
              Đăng ký tài khoản hành khách
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}