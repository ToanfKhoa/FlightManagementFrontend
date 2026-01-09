import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LogOut, Search, Luggage, FileCheck, PlaneTakeoff } from "lucide-react";
import { PassengerVerification } from "./staff/PassengerVerification";
import { CheckInDesk } from "./staff/CheckInDesk";
import { BaggageDesk } from "./staff/BaggageDesk";
import { useAuth } from "../context/AuthContext";

export function StaffDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("verification");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <PlaneTakeoff className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>Hệ Thống Nhân Viên</h1>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="verification">
              <Search className="w-4 h-4 mr-2" />
              Xác minh hành khách
            </TabsTrigger>
            <TabsTrigger value="checkin">
              <FileCheck className="w-4 h-4 mr-2" />
              Quầy check-in
            </TabsTrigger>
            <TabsTrigger value="baggage">
              <Luggage className="w-4 h-4 mr-2" />
              Quầy hành lý
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification">
            <PassengerVerification />
          </TabsContent>

          <TabsContent value="checkin">
            <CheckInDesk />
          </TabsContent>

          <TabsContent value="baggage">
            <BaggageDesk />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
