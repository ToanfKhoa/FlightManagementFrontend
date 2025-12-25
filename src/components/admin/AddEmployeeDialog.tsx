import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "../ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { UserPlus, User, Mail, Phone, Briefcase, Clock, Plane } from "lucide-react";
import { toast } from "sonner";

export type EmployeePosition = "PILOT" | "COPILOT" | "ATTENDANT" | "OPERATOR" | "TICKETING" | "OTHER";

export interface NewEmployeeData {
    account: {
        username: string;
        email: string;
        phone: string;
    };
    employee: {
        fullName: string;
        position: EmployeePosition;
        workExperience: string;
        totalFlightHours: number;
    };
}

interface AddEmployeeDialogProps {
    onAddEmployee?: (data: NewEmployeeData) => void;
    trigger?: React.ReactNode;
}

const POSITION_LABELS: Record<EmployeePosition, string> = {
    PILOT: "Phi công",
    COPILOT: "Phó phi công",
    ATTENDANT: "Tiếp viên",
    OPERATOR: "Vận hành",
    TICKETING: "Bán vé",
    OTHER: "Khác"
};

export function AddEmployeeDialog({ onAddEmployee, trigger }: AddEmployeeDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Account info state
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Employee info state
    const [fullName, setFullName] = useState("");
    const [position, setPosition] = useState<EmployeePosition>("PILOT");
    const [workExperience, setWorkExperience] = useState("");
    const [totalFlightHours, setTotalFlightHours] = useState("");

    const resetForm = () => {
        setUsername("");
        setEmail("");
        setPhone("");
        setFullName("");
        setPosition("PILOT");
        setWorkExperience("");
        setTotalFlightHours("");
    };

    const validateForm = (): boolean => {
        if (!username.trim()) {
            toast.error("Vui lòng nhập tên đăng nhập");
            return false;
        }

        if (!email.trim()) {
            toast.error("Vui lòng nhập email");
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Email không hợp lệ");
            return false;
        }

        if (!phone.trim()) {
            toast.error("Vui lòng nhập số điện thoại");
            return false;
        }

        // Basic phone validation (Vietnam phone number)
        const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
            toast.error("Số điện thoại không hợp lệ");
            return false;
        }

        if (!fullName.trim()) {
            toast.error("Vui lòng nhập họ tên nhân viên");
            return false;
        }

        if (!workExperience.trim()) {
            toast.error("Vui lòng nhập kinh nghiệm làm việc");
            return false;
        }

        const flightHoursNum = parseFloat(totalFlightHours);
        if (!totalFlightHours || isNaN(flightHoursNum) || flightHoursNum < 0) {
            toast.error("Vui lòng nhập số giờ bay hợp lệ");
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        const newEmployeeData: NewEmployeeData = {
            account: {
                username: username.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
            },
            employee: {
                fullName: fullName.trim(),
                position,
                workExperience: workExperience.trim(),
                totalFlightHours: parseInt(totalFlightHours),
            },
        };

        // Simulate API call
        setTimeout(() => {
            onAddEmployee?.(newEmployeeData);
            toast.success("Thêm nhân viên thành công!", {
                description: `${fullName} đã được thêm vào hệ thống.`
            });
            resetForm();
            setOpen(false);
            setIsSubmitting(false);
        }, 500);
    };

    const handleCancel = () => {
        resetForm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Thêm nhân viên
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        Thêm nhân viên mới
                    </DialogTitle>
                    <DialogDescription>
                        Điền đầy đủ thông tin tài khoản và thông tin nhân viên để tạo tài khoản mới
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                    {/* Account Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Thông tin tài khoản</h3>
                        </div>

                        <div className="grid gap-4 pl-7">
                            <div className="grid gap-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Tên đăng nhập
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="Nhập tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@airline.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Số điện thoại
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="0912345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* <Separator /> */}

                    {/* Employee Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Thông tin nhân viên</h3>
                        </div>

                        <div className="grid gap-4 pl-7">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Họ và tên
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Nguyễn Văn A"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="position" className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    Vị trí công việc
                                    <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    // value={position}
                                    // onValueChange={(value) => setPosition(value as EmployeePosition)}
                                    // disabled={isSubmitting}
                                    id="position"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value as EmployeePosition)}
                                    disabled={isSubmitting}
                                >
                                    {/* <SelectTrigger id="position">
                                        <SelectValue placeholder="Chọn vị trí" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {Object.entries(POSITION_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent> */}
                                    <option value="" disabled>Chọn vị trí</option>
                                    {Object.entries(POSITION_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="workExperience" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    Kinh nghiệm làm việc
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="workExperience"
                                    placeholder="Vd: 5 năm kinh nghiệm"
                                    value={workExperience}
                                    onChange={(e) => setWorkExperience(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="totalFlightHours" className="flex items-center gap-2">
                                    <Plane className="h-4 w-4 text-muted-foreground" />
                                    Tổng số giờ bay
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="totalFlightHours"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    value={totalFlightHours}
                                    onChange={(e) => setTotalFlightHours(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Đơn vị: giờ (hours)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Thêm nhân viên"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
