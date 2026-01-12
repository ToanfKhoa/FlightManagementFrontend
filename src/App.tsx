import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { PassengerDashboard } from "./components/PassengerDashboard";
import { PassengerLandingPage } from "./components/passenger/PassengerLandingPage";
import { StaffDashboard } from "./components/StaffDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { CrewDashboard } from "./components/CrewDashboard";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-4">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role!)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAuth();

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
            user ? <Navigate to={`/${user.role}`} replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected routes */}
        <Route
          path="/passenger"
          element={
            <ProtectedRoute>
              <PassengerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crew"
          element={
            <ProtectedRoute>
              <CrewDashboard />
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