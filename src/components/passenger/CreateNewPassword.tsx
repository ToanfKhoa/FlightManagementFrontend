import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";
import { motion } from "motion/react";
import { Progress } from "../ui/progress";
import { authService } from "../../services/authService";

interface CreateNewPasswordScreenProps {
    user: {
        avatar: string;
        displayName: string;
        email: string;
    };
    onResetPassword: (password: string) => void;
}

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Contains number", test: (p) => /[0-9]/.test(p) },
    { label: "Contains special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function CreateNewPasswordScreen({ user, onResetPassword }: CreateNewPasswordScreenProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const getPasswordStrength = (password: string): number => {
        const metRequirements = passwordRequirements.filter((req) => req.test(password)).length;
        return (metRequirements / passwordRequirements.length) * 100;
    };

    const getStrengthLabel = (strength: number): { label: string; color: string } => {
        if (strength === 0) return { label: "Enter password", color: "text-slate-400" };
        if (strength < 40) return { label: "Weak", color: "text-red-500" };
        if (strength < 60) return { label: "Fair", color: "text-orange-500" };
        if (strength < 80) return { label: "Good", color: "text-yellow-500" };
        return { label: "Strong", color: "text-green-500" };
    };

    const getStrengthColor = (strength: number): string => {
        if (strength < 40) return "bg-red-500";
        if (strength < 60) return "bg-orange-500";
        if (strength < 80) return "bg-yellow-500";
        return "bg-green-500";
    };

    const passwordStrength = getPasswordStrength(newPassword);
    const strengthInfo = getStrengthLabel(passwordStrength);
    const allRequirementsMet = passwordRequirements.every((req) => req.test(newPassword));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!newPassword) {
            setError("Please enter a new password");
            return;
        }

        if (!allRequirementsMet) {
            setError("Password does not meet all requirements");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onResetPassword(newPassword);
        }, 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-0 shadow-xl">
                <CardHeader className="space-y-4 pb-6">
                    {/* User Identity Confirmation */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                    >
                        <Avatar className="w-14 h-14 ring-2 ring-white shadow-md">
                            <AvatarImage src={user.avatar} alt={user.displayName} />
                            <AvatarFallback className="text-lg font-semibold">
                                {user.displayName.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base truncate">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <CardTitle className="text-center text-2xl">Create New Password</CardTitle>
                        <CardDescription className="text-center text-base">
                            Choose a strong password to secure your account
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-sm font-medium">
                                New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setError("");
                                    }}
                                    className="pl-10 pr-10 h-12"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {newPassword && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Password strength:</span>
                                        <span className={`font-semibold ${strengthInfo.color}`}>
                                            {strengthInfo.label}
                                        </span>
                                    </div>
                                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${passwordStrength}%` }}
                                            transition={{ duration: 0.3 }}
                                            className={`h-full ${getStrengthColor(passwordStrength)} transition-colors`}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Password Requirements */}
                        {newPassword && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-slate-50 rounded-xl p-4 space-y-2"
                            >
                                <p className="text-sm font-medium text-slate-700 mb-2">Password must contain:</p>
                                <div className="space-y-1.5">
                                    {passwordRequirements.map((req, index) => {
                                        const isMet = req.test(newPassword);
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-2"
                                            >
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isMet ? "bg-green-500" : "bg-slate-300"
                                                    } transition-colors`}>
                                                    {isMet ? (
                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                    ) : (
                                                        <X className="w-3 h-3 text-slate-500" strokeWidth={3} />
                                                    )}
                                                </div>
                                                <span className={`text-sm ${isMet ? "text-green-700 font-medium" : "text-slate-600"
                                                    }`}>
                                                    {req.label}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-medium">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError("");
                                    }}
                                    className={`pl-10 pr-10 h-12 ${confirmPassword && newPassword !== confirmPassword
                                        ? "border-red-500 focus-visible:ring-red-500"
                                        : confirmPassword && newPassword === confirmPassword
                                            ? "border-green-500 focus-visible:ring-green-500"
                                            : ""
                                        }`}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-500 font-medium flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Passwords do not match
                                </motion.p>
                            )}
                            {confirmPassword && newPassword === confirmPassword && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-green-500 font-medium flex items-center gap-1"
                                >
                                    <Check className="w-4 h-4" />
                                    Passwords match
                                </motion.p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-3"
                            >
                                <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                                    <X className="w-4 h-4" />
                                    {error}
                                </p>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold rounded-xl"
                            disabled={isLoading || !allRequirementsMet || newPassword !== confirmPassword}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Resetting Password...
                                </span>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-blue-900 font-medium mb-1">🔒 Security Notice</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                    After resetting your password, you'll be logged out of all devices. You'll need to sign in again with your new password.
                </p>
            </div>
        </motion.div>
    );
}
