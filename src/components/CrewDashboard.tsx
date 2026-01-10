import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LogOut, Calendar, Clock, Plane } from "lucide-react";
import { mockCrew, mockFlights } from "../lib/mockData";
import type { CrewMember, Flight } from "../lib/mockData";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/images/logo-icon.png";

export function CrewDashboard() {
  const { user, logout } = useAuth();
  const [crewMember, setCrewMember] = useState<CrewMember | null>(null);
  const [assignedFlights, setAssignedFlights] = useState<Flight[]>([]);

  useEffect(() => {
    if (user) {
      // Find crew member by user ID (in real app, this would be from the database)
      const member = mockCrew.find(c => c.id === user.id) || mockCrew[0];
      setCrewMember(member);

      // Get flights assigned to this crew member
      const flights = mockFlights.filter(f =>
        member.assignments.includes(f.flightCode)
      );
      setAssignedFlights(flights);
    }
  }, [user?.id]);

  const getStatusBadge = (status: Flight["status"]) => {
    const variants: Record<Flight["status"], { variant: any; label: string }> = {
      open: { variant: "default", label: "Bình thường" },
      full: { variant: "secondary", label: "Hết chỗ" },
      delayed: { variant: "destructive", label: "Chậm" },
      canceled: { variant: "destructive", label: "Đã hủy" },
      completed: { variant: "secondary", label: "Hoàn thành" },
    };

    return (
      <Badge variant={variants[status].variant as any}>{variants[status].label}</Badge>
    );
  };

  if (!crewMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="SkyWings Logo" className="w-12 h-12" />
            <div>
              <h1>Hệ Thống Phi Hành Viên</h1>
              <p className="text-sm text-gray-600">
                Xin chào, {user?.username} ({crewMember.role === "pilot" ? "Phi công" : "Tiếp viên"})
              </p>
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
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phi hành viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Vai trò</p>
                  <p className="text-xl font-bold">
                    {crewMember.role === "pilot" ? "Phi công" : "Tiếp viên"}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Số chuyến bay</p>
                  <p className="text-xl font-bold">{crewMember.assignments.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Giờ bay tháng này</p>
                  <p className="text-xl font-bold">{crewMember.monthlyHours}h</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Còn lại</p>
                  <p className="text-xl font-bold">
                    {crewMember.maxHours - crewMember.monthlyHours}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flight Schedule */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2>Lịch bay của tôi</h2>
              <Badge variant="secondary">{assignedFlights.length} chuyến bay</Badge>
            </div>

            {assignedFlights.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-gray-500">
                  <Plane className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có chuyến bay nào được phân công</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignedFlights.map((flight) => (
                  <Card key={flight.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Plane className="w-5 h-5" />
                            {flight.flightCode}
                            {getStatusBadge(flight.status)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {flight.route}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{flight.aircraftType}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Ngày bay</p>
                            <p className="font-semibold">
                              {new Date(flight.date).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Giờ khởi hành</p>
                            <p className="font-semibold">{flight.departureTime}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Giờ đến</p>
                          <p className="font-semibold">{flight.arrivalTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Xuất phát</p>
                          <p className="font-semibold">{flight.departure}</p>
                        </div>
                      </div>

                      {flight.status === "delayed" && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Chuyến bay bị chậm. Vui lòng liên hệ điều hành để biết thêm chi tiết.
                          </p>
                        </div>
                      )}

                      {flight.status === "canceled" && (
                        <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                          <p className="text-sm text-red-800">
                            ❌ Chuyến bay đã bị hủy.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
