import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plane, Wrench, Calendar, AlertCircle } from "lucide-react";
import { mockAircraft } from "../../lib/mockData";
import { toast } from "sonner@2.0.3";
import type { Aircraft } from "../../lib/mockData";

export function AircraftManagement() {
  const [aircraft, setAircraft] = useState<Aircraft[]>(mockAircraft);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  const handleStatusChange = (aircraftId: string, newStatus: Aircraft["status"]) => {
    const updatedAircraft = aircraft.map((a) => {
      if (a.id === aircraftId) {
        return { ...a, status: newStatus };
      }
      return a;
    });

    setAircraft(updatedAircraft);
    toast.success("Cập nhật trạng thái thành công!");
  };

  const getStatusBadge = (status: Aircraft["status"]) => {
    const variants: Record<Aircraft["status"], { variant: any; label: string; color: string }> = {
      active: { variant: "default", label: "Hoạt động", color: "green" },
      maintenance: { variant: "secondary", label: "Bảo trì", color: "yellow" },
      inactive: { variant: "destructive", label: "Ngừng hoạt động", color: "red" },
    };

    return (
      <Badge variant={variants[status].variant as any}>{variants[status].label}</Badge>
    );
  };

  const isMaintenanceDue = (nextMaintenance: string) => {
    const next = new Date(nextMaintenance);
    const now = new Date();
    const daysUntil = Math.floor((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 14;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Quản lý máy bay</h2>
          <p className="text-sm text-gray-600 mt-1">
            Theo dõi và quản lý trạng thái máy bay, lịch bảo trì
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số máy bay</CardDescription>
            <CardTitle className="text-3xl">{aircraft.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đang hoạt động</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {aircraft.filter((a) => a.status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đang bảo trì</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {aircraft.filter((a) => a.status === "maintenance").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cần bảo trì sớm</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {aircraft.filter((a) => isMaintenanceDue(a.nextMaintenance)).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Aircraft List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aircraft.map((ac) => (
          <Card key={ac.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    {ac.registration}
                  </CardTitle>
                  <CardDescription className="mt-1">{ac.type}</CardDescription>
                </div>
                {getStatusBadge(ac.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seat Configuration */}
              <div>
                <p className="text-sm font-semibold mb-2">Cấu hình ghế</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Phổ thông</p>
                    <p className="font-semibold">{ac.totalSeats.economy}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Thương gia</p>
                    <p className="font-semibold">{ac.totalSeats.business}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Hạng nhất</p>
                    <p className="font-semibold">{ac.totalSeats.first}</p>
                  </div>
                </div>
              </div>

              {/* Maintenance Schedule */}
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Lịch bảo trì
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bảo trì gần nhất:</span>
                    <span className="font-semibold">
                      {new Date(ac.lastMaintenance).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bảo trì tiếp theo:</span>
                    <span className="font-semibold">
                      {new Date(ac.nextMaintenance).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {isMaintenanceDue(ac.nextMaintenance) && ac.status === "active" && (
                  <div className="bg-red-50 border border-red-200 p-2 rounded mt-2 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <p className="text-xs text-red-800">
                      Cần lên lịch bảo trì trong vòng 14 ngày
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedAircraft(ac)}
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Quản lý
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{ac.registration} - {ac.type}</DialogTitle>
                      <DialogDescription>
                        Cập nhật trạng thái và thông tin máy bay
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Trạng thái hiện tại</p>
                        <div className="mb-3">{getStatusBadge(ac.status)}</div>
                        <p className="text-sm font-semibold mb-2">Thay đổi trạng thái</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant={ac.status === "active" ? "default" : "outline"}
                            onClick={() => handleStatusChange(ac.id, "active")}
                          >
                            Hoạt động
                          </Button>
                          <Button
                            variant={ac.status === "maintenance" ? "default" : "outline"}
                            onClick={() => handleStatusChange(ac.id, "maintenance")}
                          >
                            Bảo trì
                          </Button>
                          <Button
                            variant={ac.status === "inactive" ? "destructive" : "outline"}
                            onClick={() => handleStatusChange(ac.id, "inactive")}
                          >
                            Ngừng
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID máy bay:</span>
                          <span className="font-semibold">{ac.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số đăng ký:</span>
                          <span className="font-semibold">{ac.registration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loại máy bay:</span>
                          <span className="font-semibold">{ac.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng số ghế:</span>
                          <span className="font-semibold">
                            {ac.totalSeats.economy + ac.totalSeats.business + ac.totalSeats.first}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
