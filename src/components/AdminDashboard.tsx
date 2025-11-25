import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LogOut, Users, Plane, Calendar, FileBarChart, PlaneTakeoff } from "lucide-react";
import { CrewManagement } from "./admin/CrewManagement";
import { AircraftManagement } from "./admin/AircraftManagement";
import { FlightOperations } from "./admin/FlightOperations";
import { Reports } from "./admin/Reports";
import type { User } from "../App";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("crew");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <PlaneTakeoff className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>Hệ Thống Quản Trị</h1>
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
            <TabsTrigger value="crew">
              <Users className="w-4 h-4 mr-2" />
              Quản lý phi hành đoàn
            </TabsTrigger>
            <TabsTrigger value="aircraft">
              <Plane className="w-4 h-4 mr-2" />
              Quản lý máy bay
            </TabsTrigger>
            <TabsTrigger value="operations">
              <Calendar className="w-4 h-4 mr-2" />
              Điều hành bay
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileBarChart className="w-4 h-4 mr-2" />
              Báo cáo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crew">
            <CrewManagement />
          </TabsContent>

          <TabsContent value="aircraft">
            <AircraftManagement />
          </TabsContent>

          <TabsContent value="operations">
            <FlightOperations />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
