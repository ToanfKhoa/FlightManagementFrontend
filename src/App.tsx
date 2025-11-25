import { useState } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { PassengerDashboard } from "./components/PassengerDashboard";
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  if (!user) {
    if (showRegister) {
      return (
        <>
          <Register onBack={handleBackToLogin} onRegisterSuccess={handleRegisterSuccess} />
          <Toaster />
        </>
      );
    }
    
    return (
      <>
        <Login onLogin={handleLogin} onRegister={handleShowRegister} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === "passenger" && (
        <PassengerDashboard user={user} onLogout={handleLogout} />
      )}
      {user.role === "staff" && (
        <StaffDashboard user={user} onLogout={handleLogout} />
      )}
      {user.role === "admin" && (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}
      {user.role === "crew" && (
        <CrewDashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </div>
  );
}

export default App;