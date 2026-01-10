import React, { useState } from "react";
import {
    User, Calendar, Flag, CreditCard,
    MapPin, Phone, Mail, Shield, Lock,
    Edit2, Save, X
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

// Mock Data Type
interface PassengerProfile {
    fullName: string;
    dob: string;
    nationality: string;
    idNumber: string;
    address: string;
    phone: string;
    email: string;
    username: string;
    role: "ADMIN" | "USER" | "STAFF";
}

export default function PassengerDetailView() {
    const [isEditing, setIsEditing] = useState(true); // Default state as requested

    // Mock Data
    const [data] = useState<PassengerProfile>({
        fullName: "Nguyen Van A",
        dob: "1995-08-15",
        nationality: "Vietnam",
        idNumber: "079095001234",
        address: "123 Le Loi St, Ben Nghe Ward, Dist 1, HCMC",
        phone: "+84 909 123 456",
        email: "nguyen.vana@example.com",
        username: "nguyenvana_admin",
        role: "ADMIN",
    });

    return (
        <div className="w-full min-h-screen bg-slate-50/50 p-6 flex gap-6 items-start">

            {/* --- LEFT COLUMN: Baggage Panel (Placeholder) --- */}
            <div className="w-1/3 hidden md:block">
                <Card className="h-full border-dashed border-2 shadow-sm bg-white/50">
                    <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center h-64 gap-2">
                        <span className="font-medium">Baggage Calculation Panel</span>
                        <span className="text-sm">(Existing Component)</span>
                    </div>
                </Card>
            </div>

            {/* --- RIGHT COLUMN: Passenger Profile --- */}
            <div className="flex-1 w-full max-w-3xl">
                <Card className="shadow-md border-border bg-white">

                    {/* Header & Toggle */}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Passenger Information
                            </CardTitle>
                            <CardDescription>
                                Manage personal details and account settings.
                            </CardDescription>
                        </div>

                        <Button
                            variant={isEditing ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                            className="gap-2 transition-all"
                        >
                            {isEditing ? (
                                <> <Save className="w-4 h-4" /> Save Changes </>
                            ) : (
                                <> <Edit2 className="w-4 h-4" /> Edit Profile </>
                            )}
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-8">

                        {/* SECTION 1: Personal Identity */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                Personal Identity
                                <Separator className="flex-1" />
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullname">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullname"
                                            defaultValue={data.fullName}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="dob"
                                            type="date"
                                            defaultValue={data.dob}
                                            disabled={!isEditing}
                                            className="pl-9 block"
                                        />
                                    </div>
                                </div>

                                {/* Nationality (Select) */}
                                <div className="space-y-2">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <div className="relative">
                                        <Flag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                        <select
                                            id="nationality"
                                            disabled={!isEditing}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                            defaultValue={data.nationality}
                                        >
                                            <option value="Vietnam">Vietnam</option>
                                            <option value="USA">United States</option>
                                            <option value="Japan">Japan</option>
                                        </select>
                                    </div>
                                </div>

                                {/* ID Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="idNumber">ID / Passport Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="idNumber"
                                            defaultValue={data.idNumber}
                                            disabled={!isEditing}
                                            className="pl-9 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2: Contact Details */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                Contact Details
                                <Separator className="flex-1" />
                            </h3>

                            <div className="space-y-5">
                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            defaultValue={data.address}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                defaultValue={data.phone}
                                                disabled={!isEditing}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    {/* Email (Read Only) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex justify-between">
                                            Email Address
                                            <span className="text-xs text-muted-foreground font-normal italic">Read-only</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                defaultValue={data.email}
                                                readOnly
                                                disabled
                                                className="pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed select-none border-dashed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 3: Account Settings (Distinct Style) */}
                        <div className="rounded-lg border border-border bg-slate-50/80 p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-slate-500" />
                                System Account
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                                {/* Username */}
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs text-muted-foreground">Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        readOnly
                                        className="h-9 bg-white text-sm font-medium"
                                    />
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground block">Current Role</Label>
                                    <div className="h-9 flex items-center">
                                        <Badge variant="secondary" className="px-3 py-1 text-xs font-bold tracking-wide">
                                            {data.role}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Change Password */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground block invisible">Action</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-200 justify-start"
                                    >
                                        <Lock className="w-3.5 h-3.5 mr-2" />
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}