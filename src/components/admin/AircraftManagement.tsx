import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plane, Wrench, Plus } from "lucide-react";
import { toast } from "sonner";
import { aircraftService } from "../../services/aircraftService";
import type { Aircraft, CreateAircraftRequest, AircraftsPageResponse } from "../../types/aircraftType";
import type { ApiResponse } from "../../types/commonType";

export function AircraftManagement() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [allAircraft, setAllAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAircraft, setNewAircraft] = useState<CreateAircraftRequest>({
    type: '',
    seatCapacity: 0,
    registrationNumber: '',
    manufacturer: '',
    model: '',
    manufactureYear: 0,
    serialNumber: '',
    status: 'ACTIVE'
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchAircrafts = async () => {
    try {
      setLoading(true);
      const res = await aircraftService.getAll({
        page: page,
        size: size,
        search: debouncedSearch,
        status: selectedStatus === "ALL" ? "" : selectedStatus,
        sort: "updatedAt,desc"
      });

      const response = res as ApiResponse<AircraftsPageResponse>;
      if (response?.data) {
        setAircraft(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err: any) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to first page on new search
    }, 500); // delay 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchAircrafts();
  }, [page, size, debouncedSearch, selectedStatus]);

  useEffect(() => {
    aircraftService.getAll({ all: true })
      .then((data) => setAllAircraft(data as Aircraft[]))
      .catch(() => {
        toast.error("Không tải được danh sách máy bay");
      });
  }, []);

  const handleStatusChange = (aircraftId: number, newStatus: Aircraft["status"]) => {
    aircraftService
      .update(aircraftId, { status: newStatus })
      .then((updatedAircraft) => {
        setAircraft((prev) =>
          prev.map((a) => (a.id === aircraftId ? updatedAircraft : a))
        );
        setAllAircraft((prev) =>
          prev.map((a) => (a.id === aircraftId ? updatedAircraft : a))
        );
        toast.success("Cập nhật trạng thái thành công!");
      })
      .catch(() => {
        toast.error("Không thể cập nhật trạng thái máy bay");
      });
  };

  const handleCreateAircraft = () => {
    aircraftService
      .create(newAircraft)
      .then((createdAircraft) => {
        // Refresh the aircraft list
        fetchAircrafts();
        setAllAircraft(prev => [...prev, createdAircraft]);
        toast.success("Tạo máy bay thành công!");
        setIsCreateDialogOpen(false);
        setNewAircraft({
          type: '',
          seatCapacity: 0,
          registrationNumber: '',
          manufacturer: '',
          model: '',
          manufactureYear: 0,
          serialNumber: '',
          status: 'ACTIVE'
        });
      })
      .catch(() => {
        toast.error("Không thể tạo máy bay");
      });
  };

  const getStatusBadge = (status: Aircraft["status"]) => {
    const variants: Record<Aircraft["status"], { variant: any; label: string }> = {
      ACTIVE: { variant: "default", label: "Hoạt động" },
      MAINTENANCE: { variant: "secondary", label: "Bảo trì" },
      INACTIVE: { variant: "destructive", label: "Ngừng hoạt động" },
    };

    const variantData = variants[status];
    if (!variantData) {
      return <Badge variant="outline">Không xác định</Badge>;
    }

    return (
      <Badge variant={variantData.variant as any}>{variantData.label}</Badge>
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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm máy bay mới
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 items-center mb-4">
        <Input
          placeholder="Tìm kiếm theo số đăng ký hoặc loại máy bay..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Dropdown Status */}
        <select
          className="border p-2 rounded"
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
        >
          <option value="">Tất cả</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="MAINTENANCE">Bảo trì</option>
          <option value="INACTIVE">Ngừng hoạt động</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số máy bay</CardDescription>
            <CardTitle className="text-3xl">{allAircraft.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đang hoạt động</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {allAircraft.filter((a) => a && a.status === "ACTIVE").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đang bảo trì</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {allAircraft.filter((a) => a && a.status === "MAINTENANCE").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Create Aircraft Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm máy bay mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo máy bay mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Loại máy bay</Label>
                <Input
                  id="type"
                  value={newAircraft.type}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="Ví dụ: Boeing 737"
                />
              </div>
              <div>
                <Label htmlFor="registrationNumber">Số đăng ký</Label>
                <Input
                  id="registrationNumber"
                  value={newAircraft.registrationNumber}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  placeholder="Ví dụ: VN-A123"
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Nhà sản xuất</Label>
                <Input
                  id="manufacturer"
                  value={newAircraft.manufacturer}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="Ví dụ: Boeing"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newAircraft.model}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Ví dụ: 737-800"
                />
              </div>
              <div>
                <Label htmlFor="manufactureYear">Năm sản xuất</Label>
                <Input
                  id="manufactureYear"
                  type="number"
                  value={newAircraft.manufactureYear}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, manufactureYear: parseInt(e.target.value) || 0 }))}
                  placeholder="Ví dụ: 2020"
                />
              </div>
              <div>
                <Label htmlFor="serialNumber">Số serial</Label>
                <Input
                  id="serialNumber"
                  value={newAircraft.serialNumber}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Ví dụ: 123456"
                />
              </div>
              <div>
                <Label htmlFor="seatCapacity">Sức chứa ghế</Label>
                <Input
                  id="seatCapacity"
                  type="number"
                  value={newAircraft.seatCapacity}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, seatCapacity: parseInt(e.target.value) || 0 }))}
                  placeholder="Ví dụ: 180"
                />
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>

                <select
                  className="border p-2 rounded w-full"
                  value={newAircraft.status}
                  onChange={(e) => setNewAircraft(prev => ({ ...prev, status: e.target.value as Aircraft['status'] }))}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateAircraft}>
                Tạo máy bay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Aircraft List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aircraft.filter((a) => a).map((ac) => (
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
      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Trang {page + 1} / {totalPages || 1}</div>
        <div className="flex gap-2">
          <Button disabled={page <= 0 || loading} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</Button>
          <Button disabled={page >= (totalPages - 1) || loading} onClick={() => setPage(p => Math.min((totalPages - 1) || p + 1, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
