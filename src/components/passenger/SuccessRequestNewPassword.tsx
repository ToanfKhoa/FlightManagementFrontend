import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MailCheck, ArrowRight, Mail } from "lucide-react";
import { motion } from "motion/react";

interface SuccessScreenProps {
    email: string;
    onBackToLogin: () => void;
}

export function SuccessScreen({ email, onBackToLogin }: SuccessScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-0 shadow-xl">
                <CardHeader className="space-y-6 pb-6 pt-8">
                    {/* Success Icon with Animation */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            {/* Pulsing background */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                            />

                            {/* Icon container */}
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(to bottom right, #afebc5ff, #174726ff)' }}>
                                <MailCheck className="w-12 h-12 text-black" strokeWidth={2} />
                            </div>

                            {/* Checkmark animation */}
                            {/* <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                                className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                            >
                                <motion.svg
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.5, duration: 0.3 }}
                                    className="w-5 h-5 text-green-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <motion.path d="M5 13l4 4L19 7" />
                                </motion.svg>
                            </motion.div> */}
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <CardTitle className="text-center text-2xl">Check Your Email</CardTitle>
                        <CardDescription className="text-center text-base leading-relaxed">
                            We've sent a password reset link to
                            <span className="block font-semibold text-foreground mt-1"> {email}</span>
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-8">
                    <Button
                        onClick={onBackToLogin}
                        className="w-full h-12 text-base font-semibold rounded-xl"
                    >
                        Back to Login
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    {/* Additional Information */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm text-slate-700 font-medium">
                            Didn't receive the email?
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                            <li>Check your spam or junk folder</li>
                            <li>Make sure you entered the correct email</li>
                            <li>Wait a few minutes and check again</li>
                        </ul>
                        <Button
                            variant="link"
                            className="text-sm font-semibold p-0 h-auto mt-2"
                            onClick={() => alert("Resending email...")}
                        >
                            Resend reset link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Help Text */}
            <p className="text-center text-sm text-muted-foreground mt-6">
                Need more help? Contact:{" "}
                <button className="text-primary font-semibold hover:underline">
                    1900 1100
                </button>
            </p>
        </motion.div>
    );
}
