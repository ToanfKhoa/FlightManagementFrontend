import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plane, AlertTriangle, Clock, X } from "lucide-react";
import { mockFlights } from "../../lib/mockData";
import { toast } from "sonner";
import type { Flight } from "../../lib/mockData";

export function FlightOperations() {
  const [flights, setFlights] = useState<Flight[]>(mockFlights);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(0);

  const handleDelayFlight = () => {
    if (!selectedFlight) return;

    const updatedFlights = flights.map((f) => {
      if (f.id === selectedFlight.id) {
        return { ...f, status: "delayed" as const };
      }
      return f;
    });

    setFlights(updatedFlights);
    toast.success(`Chuyến bay ${selectedFlight.flightCode} đã được đánh dấu chậm ${delayMinutes} phút`);
    setSelectedFlight(null);
  };

  const handleCancelFlight = (flight: Flight) => {
    const updatedFlights = flights.map((f) => {
      if (f.id === flight.id) {
        return { ...f, status: "canceled" as const };
      }
      return f;
    });

    setFlights(updatedFlights);
    toast.success(`Chuyến bay ${flight.flightCode} đã bị hủy. Hệ thống sẽ thông báo cho hành khách.`);
  };

  const handleReactivateFlight = (flight: Flight) => {
    const updatedFlights = flights.map((f) => {
      if (f.id === flight.id) {
        return { ...f, status: "open" as const };
      }
      return f;
    });

    setFlights(updatedFlights);
    toast.success(`Chuyến bay ${flight.flightCode} đã được kích hoạt lại`);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Điều hành bay</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý trạng thái chuyến bay, xử lý chậm/hủy chuyến
          </p>
        </div>
      </div>

      {/* Summary Cards */}
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
              {flights.filter((f) => f.status === "open").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hết chỗ</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {flights.filter((f) => f.status === "full").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Chậm</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {flights.filter((f) => f.status === "delayed").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đã hủy</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {flights.filter((f) => f.status === "canceled").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Flight List */}
      <div className="space-y-4">
        {flights.map((flight) => (
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
                    {flight.route} • {flight.aircraftType}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ngày bay</p>
                  <p className="font-semibold">
                    {new Date(flight.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ khởi hành</p>
                  <p className="font-semibold">{flight.departureTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ đến</p>
                  <p className="font-semibold">{flight.arrivalTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chỗ trống</p>
                  <p className="font-semibold">
                    {flight.availableSeats.economy +
                      flight.availableSeats.business +
                      flight.availableSeats.first}
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
                {flight.status === "open" && (
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
                            Nhập thời gian chậm dự kiến. Hệ thống sẽ tự động thông báo cho
                            hành khách.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="delay">Thời gian chậm (phút)</Label>
                            <Input
                              id="delay"
                              type="number"
                              min="0"
                              value={delayMinutes}
                              onChange={(e) => setDelayMinutes(Number(e.target.value))}
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

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <X className="w-4 h-4 mr-2" />
                          Hủy chuyến bay
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Hủy chuyến bay</DialogTitle>
                          <DialogDescription>
                            Bạn có chắc chắn muốn hủy chuyến bay {flight.flightCode}?
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
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleCancelFlight(flight)}
                            >
                              Xác nhận hủy
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {flight.status === "delayed" && (
                  <Button variant="outline" onClick={() => handleReactivateFlight(flight)}>
                    Kích hoạt lại
                  </Button>
                )}

                {flight.status === "canceled" && (
                  <Button variant="outline" onClick={() => handleReactivateFlight(flight)}>
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
