import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LogOut, Calendar, Clock, Plane, User, Briefcase, Award, UserCheck } from "lucide-react";
import { assignmentService } from "../services/assignmentService";
import type { Employee } from "../types/employeeType";
import type { Flight } from "../types/flightType";
import type { Assignment } from "../types/assignmentType";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/images/logo-icon.png";

export function CrewDashboard() {
  const { user, employee, logout } = useAuth();
  const [assignedFlights, setAssignedFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (iso: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    if (!user || !employee) return;

    const fetchData = async () => {
      try {
        const assignmentsRes = await assignmentService.getEmployeeAssignments(employee.id);
        const assignments = assignmentsRes.data.content;
        const flights = assignments.map((a: Assignment) => a.flight);
        setAssignedFlights(flights);
      } catch (error) {
        console.error('Error fetching crew data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employee?.id]);

  const getStatusBadge = (status: Flight["status"]) => {
    const variants: Record<Flight["status"], { variant: any; label: string }> = {
      OPEN: { variant: "default", label: "Bình thường" },
      FULL: { variant: "secondary", label: "Hết chỗ" },
      DELAYED: { variant: "destructive", label: "Chậm" },
      CANCELED: { variant: "destructive", label: "Đã hủy" },
      COMPLETED: { variant: "secondary", label: "Hoàn thành" },
      DEPARTED: { variant: "secondary", label: "Đã khởi hành" },
    };

    return (
      <Badge variant={variants[status].variant as any}>{variants[status].label}</Badge>
    );
  };

  if (!user || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vui lòng đăng nhập để tiếp tục.</p>
      </div>
    );
  }

  if (loading) {
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
                Xin chào, {employee.fullName} ({employee.position === "PILOT" || employee.position === "COPILOT" ? "Phi công" : "Tiếp viên"})
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
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Họ tên:</strong> {employee.fullName}</p>
                    <p className="text-sm text-gray-600"><strong>Vai trò:</strong> {employee.position === "PILOT" || employee.position === "COPILOT" ? "Phi công" : "Tiếp viên"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>Email:</strong> {user.email}</p>
                    <p className="text-sm text-gray-600"><strong>Số điện thoại:</strong> {user.phone}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <Briefcase className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Kinh nghiệm</p>
                  <p className="text-lg font-bold">{employee.workExperience}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Award className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Tổng giờ bay tháng này</p>
                  <p className="text-lg font-bold">{employee.totalFlightHours}h</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Giờ bay tối đa</p>
                  <p className="text-lg font-bold">{employee.maxFlightHoursPerMonth}h</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <Plane className="w-6 h-6 text-yellow-600 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Còn lại</p>
                  <p className="text-lg font-bold">
                    {employee.maxFlightHoursPerMonth - employee.totalFlightHours}h
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
                            {flight.id}
                            {getStatusBadge(flight.status)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {flight.route.origin} - {flight.route.destination}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{flight.aircraft.type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Khởi hành từ {flight.route.origin}</p>
                            <p className="font-semibold">{formatDateTime(flight.departureTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Đến {flight.route.destination}</p>
                            <p className="font-semibold">{formatDateTime(flight.arrivalTime)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Máy bay</p>
                          <p className="font-semibold">{flight.aircraft.type}</p>
                        </div>
                      </div>

                      {flight.status === "DELAYED" && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Chuyến bay bị chậm. Vui lòng liên hệ điều hành để biết thêm chi tiết.
                          </p>
                        </div>
                      )}

                      {flight.status === "CANCELED" && (
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
