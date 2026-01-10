import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { passengerService } from "../services/passengerService";
import type { RegisterRequest, LoginResponse } from "../types/authType";
import Passenger from "../types/passengerType";
import logoIcon from "../assets/images/logo-icon.png";

interface RegisterProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export function Register({ onBack, onRegisterSuccess }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // User Account fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Passenger fields
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("Việt Nam");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    // Username uniqueness should be validated server-side. We rely on API error responses for duplicates.

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate age (must be at least 12 years old)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 12) {
      toast.error("Hành khách phải từ 12 tuổi trở lên để đăng ký tài khoản!");
      return;
    }

    try {
      const registerRequest: RegisterRequest = {
        //fullName,
        username,
        email,
        phone,
        password,
        //dateOfBirth,
      };
      const payload: Passenger = {
        accountRequest: registerRequest,
        fullName: fullName,
        dateOfBirth: dateOfBirth,
        nationality: nationality,
        idNumber: idNumber,
        address: address,
        phone: phone
      }

      const response = (await passengerService.createPassenger(payload)) as LoginResponse | any;

      // If the API returned a token and user, persist and auto login, else just show success
      if (response?.token && response?.user) {
        localStorage.setItem("user", JSON.stringify({ token: response.token, user: response.user }));
        toast.success("Đăng ký thành công và đã đăng nhập tự động");
        // We can notify parent app to update UI. If onRegisterSuccess should hide the register screen, we call it.
        onRegisterSuccess();
      } else {
        toast.success(response?.message || "Đăng ký thành công! Vui lòng đăng nhập.");
        onRegisterSuccess();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Đăng ký thất bại";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoIcon} alt="SkyWings Logo" className="w-16 h-16" />
          </div>
          <CardTitle>Đăng ký tài khoản hành khách</CardTitle>
          <CardDescription>
            {step === 1 ? "Bước 1/2: Thông tin tài khoản" : "Bước 2/2: Thông tin cá nhân"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="taikhoan123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button type="submit" className="flex-1">
                  Tiếp tục
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Ngày sinh <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">
                    Quốc tịch <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nationality"
                    placeholder="Việt Nam"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">
                    CMND/Hộ chiếu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="idNumber"
                    placeholder="001234567890"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Địa chỉ liên hệ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  Hoàn tất đăng ký
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <button
                onClick={onBack}
                className="text-blue-600 hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
