import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from "../types/authType"
import { authService } from '../services/authService';
import { LoginResponse } from '../types/authType';
import type { Employee } from '../types/employeeType';
import type { Passenger } from '../types/passengerType';

interface AuthContextType {
    user: User | null;
    employee: Employee | null;
    passenger: Passenger | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [passenger, setPassenger] = useState<Passenger | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = (await authService.getMe()) as LoginResponse;
                    const userData = response.data;
                    // Map role based on employee
                    let mappedRole = userData.user.role as UserRole;
                    if (userData.employee != null) {
                        if (userData.employee.position === "TICKETING") {
                            mappedRole = "staff";
                        } else {
                            mappedRole = "crew";
                        }
                    }
                    setUser({ ...userData.user, role: mappedRole });
                    setEmployee(userData.employee);
                    setPassenger(userData.passenger);
                } catch (error) {
                    console.error("Check auth failed:", error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentialId: string, password: string) => {
        try {
            const res = (await authService.login(credentialId, password)) as LoginResponse;

            const { accessToken, refreshToken, user, employee, passenger } = res.data;

            // Map role based on employee
            let mappedRole: UserRole = user.role as UserRole;
            if (employee != null) {
                if (employee.position === "TICKETING") {
                    mappedRole = "staff";
                } else {
                    mappedRole = "crew";
                }
            }

            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            setUser({ ...user, role: mappedRole });
            setEmployee(employee);
            setPassenger(passenger);

            navigate(`/${mappedRole}`);
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        console.log("Log out")
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setEmployee(null);
        setPassenger(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, employee, passenger, login, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Custom hook để dùng cho gọn
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};