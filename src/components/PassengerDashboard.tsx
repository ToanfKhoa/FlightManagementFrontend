import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LogOut, Search, Ticket, Luggage, PlaneTakeoff, FileText } from "lucide-react";
import { FlightSearch } from "./passenger/FlightSearch";
import { MyBookings } from "./passenger/MyBookings";
import { CheckInPage } from "./passenger/CheckInPage";
import { BaggageCalculator } from "./passenger/BaggageCalculator";
import type { User } from "../App";

interface PassengerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function PassengerDashboard({ user, onLogout }: PassengerDashboardProps) {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <PlaneTakeoff className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>Hệ Thống Chuyến Bay</h1>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Tìm chuyến bay
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Ticket className="w-4 h-4 mr-2" />
              Vé của tôi
            </TabsTrigger>
            <TabsTrigger value="checkin">
              <FileText className="w-4 h-4 mr-2" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="baggage">
              <Luggage className="w-4 h-4 mr-2" />
              Tính hành lý
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <FlightSearch userId={user.id} />
          </TabsContent>

          <TabsContent value="bookings">
            <MyBookings userId={user.id} />
          </TabsContent>

          <TabsContent value="checkin">
            <CheckInPage userId={user.id} />
          </TabsContent>

          <TabsContent value="baggage">
            <BaggageCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
