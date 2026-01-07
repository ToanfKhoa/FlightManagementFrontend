import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plane, AlertTriangle, Clock, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { flightService } from "../../services/flightService";
import { aircraftService } from "../../services/aircraftService";
import { routeService } from "../../services/routeService";
import type { Flight, Route, FlightStatus, FlightsPageResponse } from "../../types/flightType";
import type { Aircraft } from "../../types/aircraftType";
import type { ApiResponse } from "../../types/commonType";

export function FlightOperations() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFlight, setNewFlight] = useState({
    routeId: 0,
    aircraftId: 0,
    status: 'OPEN' as FlightStatus,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const res = await flightService.getAll({
        page: page,
        size: size,
        search: debouncedSearch,
        status: selectedStatus === "ALL" ? "" : selectedStatus,
        sort: "updatedAt,desc"
      });

      const response = res as ApiResponse<FlightsPageResponse>;
      if (response?.data) {
        const flightsWithComputed = response.data.content.map(flight => ({
          ...flight,
          date: new Date(flight.departureTime).toISOString().split('T')[0],
          departureTime: new Date(flight.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          arrivalTime: new Date(flight.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }));
        setFlights(flightsWithComputed);
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
    fetchFlights();
  }, [page, size, debouncedSearch, selectedStatus]);

  useEffect(() => {
    Promise.all([
      flightService.getAll({ all: true }),
      routeService.getAll(),
      aircraftService.getAll({ all: true }),
    ])
      .then(([allFlightsData, routesData, aircraftsData]) => {
        const allFlightsWithComputed = (allFlightsData.data.content as Flight[]).map(flight => ({
          ...flight,
          date: new Date(flight.departureTime).toISOString().split('T')[0],
          departureTime: new Date(flight.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          arrivalTime: new Date(flight.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }));
        setAllFlights(allFlightsWithComputed);
        setRoutes(routesData);
        setAircrafts(aircraftsData as Aircraft[]);
        // Set default values to first items
        if (routesData.length > 0 && (aircraftsData as Aircraft[]).length > 0) {
          setNewFlight({
            routeId: routesData[0].id,
            aircraftId: (aircraftsData as Aircraft[])[0].id,
            status: 'OPEN',
          });
        }
      })
      .catch(() => {
        toast.error("Không tải được dữ liệu");
      });
  }, []);

  const handleDelayFlight = () => {
    if (!selectedFlight) return;

    setFlights((prev) =>
      prev.map((f) =>
        f.id === selectedFlight.id ? { ...f, status: "DELAYED" } : f
      )
    );
    setAllFlights((prev) =>
      prev.map((f) =>
        f.id === selectedFlight.id ? { ...f, status: "DELAYED" } : f
      )
    );

    toast.success(
      `Chuyến bay ${selectedFlight.id} đã được đánh dấu chậm ${delayMinutes} phút`
    );
    setSelectedFlight(null);
  };

  const handleCancelFlight = (flight: Flight) => {
    setFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "CANCELED" } : f
      )
    );
    setAllFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "CANCELED" } : f
      )
    );

    toast.success(
      `Chuyến bay ${flight.id} đã bị hủy. Hệ thống sẽ thông báo cho hành khách.`
    );
  };

  const handleReactivateFlight = (flight: Flight) => {
    setFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "OPEN" } : f
      )
    );
    setAllFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "OPEN" } : f
      )
    );

    toast.success(`Chuyến bay ${flight.id} đã được kích hoạt lại`);
  };

  const handleCreateFlight = async () => {
    try {
      const newFlightData = await flightService.create({
        routeId: newFlight.routeId,
        aircraftId: newFlight.aircraftId,
        status: newFlight.status,
      });
      const route = routes.find(r => r.id === (newFlightData as any).routeId) || newFlightData.route;
      const aircraft = aircrafts.find(a => a.id === (newFlightData as any).aircraftId) || newFlightData.aircraft;
      const flightWithDetails = {
        ...newFlightData,
        route,
        aircraft,
        status: newFlight.status,
      };
      setFlights((prev) => [...prev, flightWithDetails]);
      setAllFlights((prev) => [...prev, flightWithDetails]);
      toast.success("Chuyến bay mới đã được tạo thành công");
      setShowCreateDialog(false);
      setNewFlight({ routeId: 0, aircraftId: 0, status: 'OPEN' });
    } catch (error) {
      toast.error("Không thể tạo chuyến bay mới");
    }
  };

  const getStatusBadge = (status: Flight["status"]) => {
    const variants: Record<
      string,
      { variant: any; label: string }
    > = {
      open: { variant: "default", label: "Bình thường" },
      full: { variant: "secondary", label: "Hết chỗ" },
      delayed: { variant: "destructive", label: "Chậm" },
      canceled: { variant: "destructive", label: "Đã hủy" },
      completed: { variant: "secondary", label: "Hoàn thành" },
      departed: { variant: "secondary", label: "Khởi hành" },
    };

    const key = String(status ?? '').toLowerCase();
    const v = variants[key] ?? { variant: "default", label: key };
    return <Badge variant={v.variant}>{v.label}</Badge>;
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Điều hành bay</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý trạng thái chuyến bay, xử lý chậm/hủy chuyến
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo chuyến bay mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo chuyến bay mới</DialogTitle>
              <DialogDescription>
                Chọn tuyến bay, máy bay và trạng thái cho chuyến bay mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="route">Tuyến bay</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={newFlight.routeId}
                  onChange={(e) => setNewFlight({ ...newFlight, routeId: parseInt(e.target.value) })}
                >
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.origin} → {route.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aircraft">Máy bay</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={newFlight.aircraftId}
                  onChange={(e) => setNewFlight({ ...newFlight, aircraftId: parseInt(e.target.value) })}
                >
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.id} value={aircraft.id}>
                      {aircraft.type} ({aircraft.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={newFlight.status}
                  onChange={(e) => setNewFlight({ ...newFlight, status: e.target.value as FlightStatus })}
                >
                  <option value="OPEN">Bình thường</option>
                  <option value="FULL">Hết chỗ</option>
                  <option value="DELAYED">Chậm</option>
                  <option value="CANCELED">Đã hủy</option>
                  <option value="DEPARTED">Khởi hành</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleCreateFlight}>
                Tạo chuyến bay
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-2 items-center mb-4">
        <Input
          placeholder="Tìm kiếm theo ID chuyến bay..."
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
          <option value="OPEN">Bình thường</option>
          <option value="FULL">Hết chỗ</option>
          <option value="DELAYED">Chậm</option>
          <option value="CANCELED">Đã hủy</option>
          <option value="DEPARTED">Khởi hành</option>
          <option value="COMPLETED">Hoàn thành</option>
        </select>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng chuyến bay</CardDescription>
            <CardTitle className="text-3xl">{allFlights.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Bình thường</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {allFlights.filter((f) => f.status === "OPEN").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hết chỗ</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {allFlights.filter((f) => f.status === "FULL").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Chậm</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {allFlights.filter((f) => f.status === "DELAYED").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đã hủy</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {allFlights.filter((f) => f.status === "CANCELED").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {loading ?
        (<div className="text-center py-10">Loading flights...</div>)
        :
        (
          <>
            <div className="space-y-4">
              {flights.map((flight) => (
                <Card key={flight.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="w-5 h-5" />
                      {flight.id}
                      {getStatusBadge(flight.status)}
                    </CardTitle>
                    <CardDescription>
                      {flight.route ? `${flight.route.origin} → ${flight.route.destination}` : '—'} • {flight.aircraft ? flight.aircraft.type : '—'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Ngày bay</p>
                        <p className="font-semibold">
                          {flight.date ? new Date(flight.date).toLocaleDateString("vi-VN") : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Giờ khởi hành</p>
                        <p className="font-semibold">{flight.departureTime ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Giờ đến</p>
                        <p className="font-semibold">{flight.arrivalTime ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Chỗ trống</p>
                        <p className="font-semibold">
                          {flight.aircraft.seatCapacity
                            ? flight.aircraft.seatCapacity
                            : '—'}
                        </p>
                      </div>
                    </div>

                    {flight.status === "DELAYED" && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-800">Chuyến bay bị chậm</p>
                          <p className="text-sm text-yellow-700">
                            Hành khách đã được thông báo qua email và SMS
                          </p>
                        </div>
                      </div>
                    )}

                    {flight.status === "CANCELED" && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
                        <X className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">Chuyến bay đã bị hủy</p>
                          <p className="text-sm text-red-700">
                            Hành khách đã được thông báo và có thể đổi/hoàn vé
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {flight.status === "OPEN" && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedFlight(flight);
                                  setDelayMinutes(0);
                                }}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Báo chậm
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Báo chậm chuyến bay</DialogTitle>
                                <DialogDescription>
                                  Nhập thời gian chậm dự kiến. Hệ thống sẽ tự động thông báo cho hành khách.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="delay">Thời gian chậm (phút)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={delayMinutes}
                                    onChange={(e) =>
                                      setDelayMinutes(Number(e.target.value))
                                    }
                                  />
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                  <p className="text-sm text-yellow-800">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                    Hành khách sẽ nhận được thông báo qua email và SMS
                                  </p>
                                </div>
                                <Button className="w-full" onClick={handleDelayFlight}>
                                  Xác nhận báo chậm
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showCancelDialog} onOpenChange={(open: boolean) => {
                            if (!open) {
                              setShowCancelDialog(false);
                              setSelectedFlight(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  setSelectedFlight(flight);
                                  setShowCancelDialog(true);
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Hủy chuyến bay
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Hủy chuyến bay</DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc chắn muốn hủy chuyến bay {selectedFlight?.id ?? flight.id}?
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                  <p className="text-sm text-red-800">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                    Hành động này sẽ:
                                  </p>
                                  <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                                    <li>Thông báo cho tất cả hành khách</li>
                                    <li>Cho phép hành khách đổi/hoàn vé</li>
                                    <li>Giải phóng tất cả ghế đã đặt</li>
                                  </ul>
                                </div>

                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => { setShowCancelDialog(false); setSelectedFlight(null); }}>
                                    Hủy
                                  </Button>
                                  <Button variant="destructive" className="flex-1" onClick={() => { handleCancelFlight(selectedFlight ?? flight); setShowCancelDialog(false); setSelectedFlight(null); }}>
                                    Xác nhận hủy
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {(flight.status === "DELAYED" ||
                        flight.status === "CANCELED") && (
                          <Button
                            variant="outline"
                            onClick={() => handleReactivateFlight(flight)}
                          >
                            Kích hoạt lại
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )
      }

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
