import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LogOut, Search, Ticket, Luggage, PlaneTakeoff, FileText } from "lucide-react";
import { FlightSearch } from "./passenger/FlightSearch";
import { MyBookings } from "./passenger/MyBookings";
import { CheckInPage } from "./passenger/CheckInPage";
import { BaggageCalculator } from "./passenger/BaggageCalculator";
import type { User } from "../App";

// Use a relative path that should work with Vite's asset handling
const backgroundImage = new URL('../assets/images/passenger-wallpaper.jpg', import.meta.url).href;

interface PassengerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function PassengerDashboard({ user, onLogout }: PassengerDashboardProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const backgroundOpacity = Math.min(scrollY / 500, 1);
  const backgroundBlur = Math.min(scrollY / 100, 10);

  return (
    <div className="min-h-screen">
      {/* Background Image Section */}
      <div
        className="fixed top-0 left-0 w-full h-screen bg-cover bg-center bg-no-repeat transition-all duration-300"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')",
          opacity: 1 - backgroundOpacity * 0.7,
          filter: `blur(${backgroundBlur}px)`,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* Overlay */}
      <div className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-40" />

      {/* Header */}
      <header className="relative bg-white/95 backdrop-blur-sm border-b sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <PlaneTakeoff className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold">Hệ Thống Chuyến Bay</h1>
              <p className="text-sm text-gray-600">Xin chào, {user.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[1600px] px-4 py-8 relative overflow-hiddenmin-h-[200vh] px-4 py-8 relative overflow-hidden"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }} >
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Content area to ensure section has height */}
          <div className="h-full w-full"></div>
        </section>

        {/* Tabs Section */}
        <div className="bg-white/95 backdrop-blur-sm sticky top-20 z-20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="search" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Tìm chuyến bay
                </TabsTrigger>
                <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Ticket className="w-4 h-4 mr-2" />
                  Vé của tôi
                </TabsTrigger>
                <TabsTrigger value="checkin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Check-in
                </TabsTrigger>
                <TabsTrigger value="baggage" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Luggage className="w-4 h-4 mr-2" />
                  Tính hành lý
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="search" className="mt-0">
              <FlightSearch userId={user.id} />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <MyBookings userId={user.id} />
            </TabsContent>

            <TabsContent value="checkin" className="mt-0">
              <CheckInPage userId={user.id} />
            </TabsContent>

            <TabsContent value="baggage" className="mt-0">
              <BaggageCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
