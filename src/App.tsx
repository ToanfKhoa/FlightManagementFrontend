import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { PassengerDashboard } from "./components/PassengerDashboard";
import { PassengerLandingPage } from "./components/passenger/PassengerLandingPage";
import { StaffDashboard } from "./components/StaffDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { CrewDashboard } from "./components/CrewDashboard";
import { Toaster } from "./components/ui/sonner";

export type UserRole = "passenger" | "staff" | "admin" | "crew" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const ProtectedRoute = ({ user, children }: { user: User | null, children: React.JSX.Element }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const showRegister = location.state?.showRegister || false;

  const handleLogin = (userData: User) => {
    setUser(userData);
    navigate(`/${userData.role}`);
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role}`} replace />
            ) : (
              <PassengerLandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={`/${user.role}`} replace />
            ) : showRegister ? (
              <Register />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/passenger"
          element={
            <ProtectedRoute user={user}>
              <PassengerDashboard user={user as User} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute user={user}>
              <StaffDashboard user={user as User} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              <AdminDashboard user={user as User} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crew"
          element={
            <ProtectedRoute user={user}>
              <CrewDashboard user={user as User} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;