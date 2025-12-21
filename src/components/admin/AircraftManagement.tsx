import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plane, Wrench } from "lucide-react";
import { toast } from "sonner";
import { aircraftService } from "../../services/aircraftService";
import type { Aircraft } from "../../types/aircraftType";

export function AircraftManagement() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  useEffect(() => {
    aircraftService
      .getAll()
      .then(setAircraft)
      .catch(() => {
        toast.error("Không tải được danh sách máy bay");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (aircraftId: number, newStatus: Aircraft["status"]) => {
    aircraftService
      .update(aircraftId, { status: newStatus })
      .then((updatedAircraft) => {
        setAircraft((prev) =>
          prev.map((a) => (a.id === aircraftId ? updatedAircraft : a))
        );
        toast.success("Cập nhật trạng thái thành công!");
      })
      .catch(() => {
        toast.error("Không thể cập nhật trạng thái máy bay");
      });
  };

  const getStatusBadge = (status: Aircraft["status"]) => {
    const variants: Record<Aircraft["status"], { variant: any; label: string }> = {
      ACTIVE: { variant: "default", label: "Hoạt động" },
      MAINTENANCE: { variant: "secondary", label: "Bảo trì" },
      INACTIVE: { variant: "destructive", label: "Ngừng hoạt động" },
    };

    return (
      <Badge variant={variants[status].variant as any}>{variants[status].label}</Badge>
    );
  };

  /*
  const isMaintenanceDue = (nextMaintenance: string) => {
    const next = new Date(nextMaintenance);
    const now = new Date();
    const daysUntil = Math.floor((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 14;
  };
  */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Quản lý máy bay</h2>
          <p className="text-sm text-gray-600 mt-1">
            Theo dõi và quản lý trạng thái máy bay
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {aircraft.filter((a) => a.status === "ACTIVE").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đang bảo trì</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {aircraft.filter((a) => a.status === "MAINTENANCE").length}
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
                    {ac.registrationNumber}
                  </CardTitle>
                  <CardDescription className="mt-1">{ac.type}</CardDescription>
                </div>
                {getStatusBadge(ac.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nhà sản xuất</p>
                  <p className="font-semibold">{ac.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-semibold">{ac.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Năm sản xuất</p>
                  <p className="font-semibold">{ac.manufactureYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số serial</p>
                  <p className="font-semibold">{ac.serialNumber}</p>
                </div>
              </div>

              {/* Seat Capacity */}
              <div>
                <p className="text-sm font-semibold mb-2">Sức chứa ghế</p>
                <p className="text-lg font-semibold">{ac.seatCapacity}</p>
              </div>

              {/* Maintenance Schedule 
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
              </div> */}

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
                      <DialogTitle>{ac.registrationNumber} - {ac.type}</DialogTitle>
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
                            variant={ac.status === "ACTIVE" ? "default" : "outline"}
                            onClick={() => handleStatusChange(ac.id, "ACTIVE")}
                          >
                            Hoạt động
                          </Button>
                          <Button
                            variant={ac.status === "MAINTENANCE" ? "default" : "outline"}
                            onClick={() => handleStatusChange(ac.id, "MAINTENANCE")}
                          >
                            Bảo trì
                          </Button>
                          <Button
                            variant={ac.status === "INACTIVE" ? "destructive" : "outline"}
                            onClick={() => handleStatusChange(ac.id, "INACTIVE")}
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
                          <span className="font-semibold">{ac.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loại máy bay:</span>
                          <span className="font-semibold">{ac.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nhà sản xuất:</span>
                          <span className="font-semibold">{ac.manufacturer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-semibold">{ac.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Năm sản xuất:</span>
                          <span className="font-semibold">{ac.manufactureYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số serial:</span>
                          <span className="font-semibold">{ac.serialNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sức chứa ghế:</span>
                          <span className="font-semibold">{ac.seatCapacity}</span>
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
