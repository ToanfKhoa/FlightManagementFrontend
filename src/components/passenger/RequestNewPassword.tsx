import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Mail, ArrowLeft, Lock } from "lucide-react";
import { motion } from "motion/react";
import { authService } from "../../services/authService";

interface RequestResetScreenProps {
    onSubmit: (email: string) => void;
    onBack: () => void;
}

export function RequestResetScreen({ onSubmit, onBack }: RequestResetScreenProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        authService.sendResetPasswordEmail(email)
            .then(() => {
                setIsLoading(false);
                onSubmit(email);
            })
            .catch((error) => {
                setIsLoading(false);
                setError("Failed to send reset email. Please try again.");
            });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-0 shadow-xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                            style={{ background: 'linear-gradient(to bottom right, #eaeaeaff, #646464ff)' }}>
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-center text-2xl">Forgot Password?</CardTitle>
                    <CardDescription className="text-center text-base">
                        Enter your email to receive a reset link
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <div className="relative">

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    className={`pl-10 h-12 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={isLoading}
                                    autoFocus
                                />
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
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-9 text-base font-semibold rounded-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Sending...
                                </span>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-12 text-base font-medium"
                            onClick={onBack}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Additional Help Text */}
            <p className="text-center text-sm text-muted-foreground mt-6">
                Remember your password?{" "}
                <button onClick={onBack} className="text-primary font-semibold hover:underline">
                    Sign in
                </button>
            </p>
        </motion.div>
    );
}
