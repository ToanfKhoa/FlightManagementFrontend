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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plane, AlertTriangle, Clock, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { flightService } from "../../services/flightService";
import { aircraftService } from "../../services/aircraftService";
import { routeService } from "../../services/routeService";
import type { Flight, Route, FlightStatus } from "../../types/flightType";
import type { Aircraft } from "../../types/aircraftType";

export function FlightOperations() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    Promise.all([
      flightService.getAll(),
      routeService.getAll(),
      aircraftService.getAll(),
    ])
      .then(([flightsData, routesData, aircraftsData]) => {
        setFlights(flightsData);
        setRoutes(routesData);
        setAircrafts(aircraftsData);
      })
      .catch(() => {
        toast.error("Không tải được dữ liệu");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelayFlight = () => {
    if (!selectedFlight) return;

    setFlights((prev) =>
      prev.map((f) =>
        f.id === selectedFlight.id ? { ...f, status: "delayed" } : f
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
        f.id === flight.id ? { ...f, status: "canceled" } : f
      )
    );

    toast.success(
      `Chuyến bay ${flight.id} đã bị hủy. Hệ thống sẽ thông báo cho hành khách.`
    );
  };

  const handleReactivateFlight = (flight: Flight) => {
    setFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "open" } : f
      )
    );

    toast.success(`Chuyến bay ${flight.id} đã được kích hoạt lại`);
  };

  const handleCreateFlight = () => {
    flightService
      .create({
        route_id: newFlight.routeId,
        aircraft_id: newFlight.aircraftId,
        status: newFlight.status,
      })
      .then((newFlightData) => {
        setFlights((prev) => [...prev, newFlightData]);
        toast.success("Chuyến bay mới đã được tạo thành công");
        setShowCreateDialog(false);
        setNewFlight({ routeId: 0, aircraftId: 0, status: 'OPEN' });
      })
      .catch(() => {
        toast.error("Không thể tạo chuyến bay mới");
      });
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

  if (loading) {
    return <div className="text-center py-10">Loading flights...</div>;
  }

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
                <Select
                  value={newFlight.routeId.toString()}
                  onValueChange={(value: string) => setNewFlight({ ...newFlight, routeId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tuyến bay" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {route.origin} → {route.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aircraft">Máy bay</Label>
                <Select
                  value={newFlight.aircraftId.toString()}
                  onValueChange={(value: string) => setNewFlight({ ...newFlight, aircraftId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn máy bay" />
                  </SelectTrigger>
                  <SelectContent>
                    {aircrafts.map((aircraft) => (
                      <SelectItem key={aircraft.id} value={aircraft.id.toString()}>
                        {aircraft.type} ({aircraft.registrationNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={newFlight.status}
                  onValueChange={(value: string) => setNewFlight({ ...newFlight, status: value as FlightStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Bình thường</SelectItem>
                    <SelectItem value="full">Hết chỗ</SelectItem>
                    <SelectItem value="delayed">Chậm</SelectItem>
                    <SelectItem value="canceled">Đã hủy</SelectItem>
                    <SelectItem value="departed">Khởi hành</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateFlight}>
                Tạo chuyến bay
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng chuyến bay</CardDescription>
            <CardTitle className="text-3xl">{flights.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Bình thường</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {flights.filter((f) => String(f.status).toLowerCase() === "open").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hết chỗ</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {flights.filter((f) => String(f.status).toLowerCase() === "full").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Chậm</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {flights.filter((f) => String(f.status).toLowerCase() === "delayed").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đã hủy</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {flights.filter((f) => String(f.status).toLowerCase() === "canceled").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

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

              {flight.status === "delayed" && (
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

              {flight.status === "canceled" && (
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
                {String(flight.status).toLowerCase() === "open" && (
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

                {(String(flight.status).toLowerCase() === "delayed" ||
                  String(flight.status).toLowerCase() === "canceled") && (
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
    </div>
  );
}
