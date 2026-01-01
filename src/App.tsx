import { useState } from "react";
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleShowLogin = () => {
    setShowAuth(true);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowAuth(true);
    setShowRegister(true);
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowAuth(false);
    setShowRegister(false);
  };

  if (!user) {
    if (showAuth) {
      if (showRegister) {
        return (
          <>
            <Register onBack={handleBackToLanding} onRegisterSuccess={handleRegisterSuccess} />
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
      <>
        <PassengerLandingPage onLogin={handleShowLogin} onRegister={handleShowRegister} />
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