import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plane, Wrench, Plus, Edit, Download } from "lucide-react";
import { toast } from "sonner";
import { exportAircraftToExcel } from "../../utils/excelExport";
import { aircraftService } from "../../services/aircraftService";
import { seatService } from "../../services/seatService";
import type { ClassSeatRequests } from "../../types/seatType";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [newAircraft, setNewAircraft] = useState<CreateAircraftRequest & { economySeats: number; businessSeats: number; firstClassSeats: number }>({
    type: '',
    seatCapacity: 0,
    registrationNumber: '',
    manufacturer: '',
    model: '',
    manufactureYear: 0,
    serialNumber: '',
    status: 'ACTIVE',
    economySeats: 0,
    businessSeats: 0,
    firstClassSeats: 0
  });
  const [updatedAircraft, setUpdatedAircraft] = useState<CreateAircraftRequest & { economySeats: number; businessSeats: number; firstClassSeats: number }>({
    type: '',
    seatCapacity: 0,
    registrationNumber: '',
    manufacturer: '',
    model: '',
    manufactureYear: 0,
    serialNumber: '',
    status: 'ACTIVE',
    economySeats: 0,
    businessSeats: 0,
    firstClassSeats: 0
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
    // Check if seat counts are multiples of 6
    if (newAircraft.economySeats % 6 !== 0 || newAircraft.businessSeats % 6 !== 0 || newAircraft.firstClassSeats % 6 !== 0) {
      toast.error("Số ghế mỗi hạng phải là bội số của 6. Vui lòng nhập lại.");
      return;
    }

    const totalSeats = newAircraft.economySeats + newAircraft.businessSeats + newAircraft.firstClassSeats;
    if (totalSeats === 0) {
      toast.error("Số ghế máy bay đang trống. Vui lòng nhập lại.");
      return;
    }

    const aircraftData = { ...newAircraft, seatCapacity: totalSeats };
    aircraftService
      .create(aircraftData)
      .then((createdAircraft) => {
        // Create seats if any seats specified
        if (totalSeats > 0) {
          const classSeatRequests: ClassSeatRequests = {};
          let currentRow = 1;

          if (newAircraft.economySeats > 0) {
            const rows = Math.ceil(newAircraft.economySeats / 6);
            classSeatRequests.ECONOMY = {
              fromRow: currentRow,
              toRow: currentRow + rows - 1,
              layoutType: 'ECONOMY_3_3',
              excludedRows: []
            };
            currentRow += rows;
          }

          if (newAircraft.businessSeats > 0) {
            const rows = Math.ceil(newAircraft.businessSeats / 6);
            classSeatRequests.BUSINESS = {
              fromRow: currentRow,
              toRow: currentRow + rows - 1,
              layoutType: 'ECONOMY_3_3',
              excludedRows: []
            };
            currentRow += rows;
          }

          if (newAircraft.firstClassSeats > 0) {
            const rows = Math.ceil(newAircraft.firstClassSeats / 6);
            classSeatRequests.FIRST_CLASS = {
              fromRow: currentRow,
              toRow: currentRow + rows - 1,
              layoutType: 'ECONOMY_3_3',
              excludedRows: []
            };
          }

          seatService.createBulk({
            aircraftId: createdAircraft.id,
            classSeatRequests: classSeatRequests as ClassSeatRequests
          }).catch(() => {
            toast.error("Tạo ghế ngồi thất bại, nhưng máy bay đã được tạo");
          });
        }

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
          status: 'ACTIVE',
          economySeats: 0,
          businessSeats: 0,
          firstClassSeats: 0
        });
      })
      .catch(() => {
        toast.error("Vui lòng nhập đầy đủ thông tin máy bay");
      });
  };

  const handleUpdateAircraft = () => {
    if (!selectedAircraft) return;

    aircraftService
      .update(selectedAircraft.id, updatedAircraft)
      .then(() => {
        toast.success("Cập nhật máy bay thành công");
        fetchAircrafts();
        setIsCreateDialogOpen(false);
        setIsEditMode(false);
        setSelectedAircraft(null);
      })
      .catch(() => toast.error("Không thể cập nhật máy bay"));
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
        <div className="flex gap-2">
          <Button onClick={() => {
            const success = exportAircraftToExcel(aircraft);
            if (success) {
              toast.success("Xuất file Excel thành công");
            } else {
              toast.error("Lỗi khi xuất file Excel");
            }
          }}>
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button onClick={() => {
            if (isEditMode) setIsEditMode(false);
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm máy bay mới
          </Button>
        </div>
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

      {/* Create or Update Aircraft Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Chỉnh sửa máy bay" : "Thêm máy bay mới"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Nhập thông tin mới cho máy bay"
                : "Nhập thông tin để tạo máy bay mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Loại máy bay</Label>
                <Input
                  id="type"
                  value={isEditMode ? updatedAircraft.type : newAircraft.type}
                  onChange={(e) =>
                    isEditMode
                      ? setUpdatedAircraft(prev => ({ ...prev, type: e.target.value }))
                      : setNewAircraft(prev => ({ ...prev, type: e.target.value }))
                  }
                  placeholder="Ví dụ: Boeing 737"
                />
              </div>

              <div>
                <Label htmlFor="registrationNumber">Số đăng ký</Label>
                <Input
                  id="registrationNumber"
                  value={isEditMode ? updatedAircraft.registrationNumber : newAircraft.registrationNumber}
                  onChange={(e) =>
                    isEditMode
                      ? setUpdatedAircraft(prev => ({ ...prev, registrationNumber: e.target.value }))
                      : setNewAircraft(prev => ({ ...prev, registrationNumber: e.target.value }))
                  }
                  placeholder="Ví dụ: VN-A123"
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Nhà sản xuất</Label>
                <Input
                  id="manufacturer"
                  value={isEditMode ? updatedAircraft.manufacturer : newAircraft.manufacturer}
                  onChange={(e) =>
                    isEditMode
                      ? setUpdatedAircraft(prev => ({ ...prev, manufacturer: e.target.value }))
                      : setNewAircraft(prev => ({ ...prev, manufacturer: e.target.value }))
                  }
                  placeholder="Ví dụ: Boeing"
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={isEditMode ? updatedAircraft.model : newAircraft.model}
                  onChange={(e) =>
                    isEditMode
                      ? setUpdatedAircraft(prev => ({ ...prev, model: e.target.value }))
                      : setNewAircraft(prev => ({ ...prev, model: e.target.value }))
                  }
                  placeholder="Ví dụ: 737-800"
                />
              </div>

              <div>
                <Label htmlFor="manufactureYear">Năm sản xuất</Label>
                <Input
                  id="manufactureYear"
                  type="number"
                  value={isEditMode ? updatedAircraft.manufactureYear : newAircraft.manufactureYear}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    isEditMode
                      ? setUpdatedAircraft(prev => ({ ...prev, manufactureYear: v }))
                      : setNewAircraft(prev => ({ ...prev, manufactureYear: v }));
                  }}
                  placeholder="Ví dụ: 2020"
                />
              </div>

              <div>
                <Label htmlFor="serialNumber">Số serial</Label>
                <Input
                  id="serialNumber"
                  value={isEditMode ? updatedAircraft.serialNumber : newAircraft.serialNumber}
                  onChange={(e) =>
                    isEditMode
                      ? setUpdatedAircraft(prev => ({ ...prev, serialNumber: e.target.value }))
                      : setNewAircraft(prev => ({ ...prev, serialNumber: e.target.value }))
                  }
                  placeholder="Ví dụ: 123456"
                />
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={isEditMode ? updatedAircraft.status : newAircraft.status}
                  onChange={(e) =>
                    isEditMode
                      ? setUpdatedAircraft(prev => ({ ...prev, status: e.target.value as Aircraft["status"] }))
                      : setNewAircraft(prev => ({ ...prev, status: e.target.value as Aircraft["status"] }))
                  }
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            {!isEditMode && (
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-0">Cấu hình số ghế ngồi</h4>
                <p className="text-sm text-gray-500 italic mb-4">Số lượng ghế mỗi hạng cần là bội số của 6</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="economySeats">Phổ thông</Label>
                    <Input
                      id="economySeats"
                      type="number"
                      value={newAircraft.economySeats}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setNewAircraft(prev => ({ ...prev, economySeats: v }));
                      }}
                      placeholder="Ví dụ: 150"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessSeats">Thương gia</Label>
                    <Input
                      id="businessSeats"
                      type="number"
                      value={newAircraft.businessSeats}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setNewAircraft(prev => ({ ...prev, businessSeats: v }));
                      }}
                      placeholder="Ví dụ: 20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="firstClassSeats">Hạng nhất</Label>
                    <Input
                      id="firstClassSeats"
                      type="number"
                      value={newAircraft.firstClassSeats}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setNewAircraft(prev => ({ ...prev, firstClassSeats: v }));
                      }}
                      placeholder="Ví dụ: 10"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                if (isEditMode) setIsEditMode(false);
              }}>
                Hủy
              </Button>
              <Button onClick={isEditMode ? handleUpdateAircraft : handleCreateAircraft}>
                {isEditMode ? "Xác nhận" : "Tạo máy bay"}
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

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedAircraft(ac);
                        setUpdatedAircraft({
                          type: ac.type,
                          seatCapacity: ac.seatCapacity,
                          registrationNumber: ac.registrationNumber,
                          manufacturer: ac.manufacturer,
                          model: ac.model,
                          manufactureYear: ac.manufactureYear,
                          serialNumber: ac.serialNumber,
                          status: ac.status,
                          economySeats: 0,
                          businessSeats: 0,
                          firstClassSeats: 0
                        });
                        setIsEditMode(true);
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </DialogTrigger>
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

