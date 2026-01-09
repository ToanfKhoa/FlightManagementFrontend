import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LogOut, Search, Ticket, Luggage, PlaneTakeoff, FileText } from "lucide-react";
import { FlightSearch } from "./passenger/FlightSearch";
import { MyBookings } from "./passenger/MyBookings";
import { CheckInPage } from "./passenger/CheckInPage";
import { BaggageCalculator } from "./passenger/BaggageCalculator";
import { useAuth } from "../context/AuthContext";

// Use a relative path that should work with Vite's asset handling
const backgroundImage = new URL('../assets/images/passenger-wallpaper.jpg', import.meta.url).href;

export function PassengerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("search");
  const [scrollY, setScrollY] = useState(0);

  const tabIndexMap: Record<string, number> = {
    search: 0,
    bookings: 1,
    checkin: 2,
    baggage: 3,
  };

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

      {/* Header */}
      <header className="relative bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <PlaneTakeoff className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold">Hệ Thống Chuyến Bay</h1>
              <p className="text-sm text-gray-600">Xin chào, {user?.username}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 py-0 relative overflow-hidden"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center top',
            backgroundAttachment: 'fixed',
            minHeight: '40vh'
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
              <TabsList className="grid w-full grid-cols-4 bg-light-blue">

                {/* Indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `calc(20px + ${tabIndexMap[activeTab]} * ((100% - 40px) / 4))`,
                    width: 24,
                    height: 24,
                    backgroundColor: "#19006dff",
                    transform: `translateY(-50%) rotate(${45 + tabIndexMap[activeTab] * 180}deg)`,
                    borderRadius: 4,
                    transition: "left 0.35s ease, transform 0.35s ease",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />

                <TabsTrigger value="search" className="flex-1 flex justify-center items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Tìm chuyến bay
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex-1 flex justify-center items-center">
                  <Ticket className="w-4 h-4 mr-2" />
                  Vé của tôi
                </TabsTrigger>
                <TabsTrigger value="checkin" className="flex-1 flex justify-center items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Check-in
                </TabsTrigger>
                <TabsTrigger value="baggage" className="flex-1 flex justify-center items-center">
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
              <FlightSearch userId={user!.id} />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <MyBookings userId={user!.id} />
            </TabsContent>

            <TabsContent value="checkin" className="mt-0">
              <CheckInPage userId={user!.id} />
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
