import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { motion } from "motion/react";
import { authService } from "../../services/authService";

export function CreateNewPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const code = searchParams.get("code");

    useEffect(() => {
        if (!code) {
            setError("Invalid reset link. No code provided.");
        }
    }, [code]);

    const validatePassword = (password: string): boolean => {
        return password.length >= 6;
    };

    const isValidPassword = validatePassword(newPassword);
    const passwordsMatch = newPassword === confirmPassword && newPassword !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!code) {
            setError("Invalid reset link. No code provided.");
            return;
        }

        if (!newPassword) {
            setError("Please enter a new password");
            return;
        }

        if (!isValidPassword) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(code, newPassword);
            navigate("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-3 pb-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                                style={{ background: 'linear-gradient(to bottom right, #abbaedff, #566fd3ff)' }}>
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-2xl">Create New Password</CardTitle>
                        <CardDescription className="text-center text-base">
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="text-sm font-medium">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setError("");
                                        }}
                                        className={`pl-10 h-12 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-sm font-medium">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setError("");
                                        }}
                                        className={`pl-10 h-12 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-500 font-medium"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold rounded-xl"
                                disabled={isLoading || !isValidPassword || !passwordsMatch}
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

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full h-12 text-base font-medium"
                                onClick={() => navigate("/login")}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Password must contain at least 6 characters.
                </p>
            </motion.div>
        </div>
    );
}
