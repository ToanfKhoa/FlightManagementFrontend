import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Search, User, Plane, Calendar, Luggage, AlertCircle } from "lucide-react";
import { mockBookings, mockFlights, formatCurrency } from "../../lib/mockData";
import { toast } from "sonner@2.0.3";
import type { Booking, Flight } from "../../lib/mockData";

export function PassengerVerification() {
  const [searchQuery, setSearchQuery] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);

  const handleSearch = () => {
    const foundBooking = mockBookings.find(
      (b) =>
        b.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.passengerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!foundBooking) {
      toast.error("Không tìm thấy thông tin");
      setBooking(null);
      setFlight(null);
      return;
    }

    const foundFlight = mockFlights.find((f) => f.id === foundBooking.flightId);

    setBooking(foundBooking);
    setFlight(foundFlight || null);
    toast.success("Tìm thấy thông tin!");
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const variants: Record<Booking["status"], { variant: any; label: string }> = {
      reserved: { variant: "secondary", label: "Đang giữ chỗ" },
      paid: { variant: "default", label: "Đã thanh toán" },
      canceled: { variant: "destructive", label: "Đã hủy" },
      "checked-in": { variant: "default", label: "Đã check-in" },
    };

    return (
      <Badge variant={variants[status].variant as any}>{variants[status].label}</Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xác minh hành khách</CardTitle>
          <CardDescription>
            Tìm kiếm theo mã vé, tên hành khách hoặc CMND/CCCD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Tìm kiếm
              </Label>
              <Input
                id="search"
                placeholder="Nhập mã vé, tên hành khách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {booking && flight && (
        <>
          {/* Passenger Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin hành khách
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-semibold">{booking.passengerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã vé</p>
                  <p className="font-mono font-semibold">{booking.ticketCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <div className="mt-1">{getStatusBadge(booking.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt vé</p>
                  <p className="font-semibold">
                    {new Date(booking.bookingDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              {booking.status === "canceled" && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Vé đã bị hủy</p>
                    <p className="text-sm text-red-700">
                      Hành khách này không được phép lên máy bay
                    </p>
                  </div>
                </div>
              )}

              {booking.status === "reserved" && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">Chưa thanh toán</p>
                    <p className="text-sm text-yellow-700">
                      Vé đang trong trạng thái giữ chỗ, chưa được thanh toán
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flight Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Thông tin chuyến bay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã chuyến bay</p>
                  <p className="font-semibold">{flight.flightCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tuyến đường</p>
                  <p className="font-semibold">{flight.route}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày bay</p>
                    <p className="font-semibold">
                      {new Date(flight.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ khởi hành</p>
                  <p className="font-semibold">{flight.departureTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Máy bay</p>
                  <p className="font-semibold">{flight.aircraftType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái chuyến bay</p>
                  <Badge>
                    {flight.status === "open"
                      ? "Bình thường"
                      : flight.status === "delayed"
                      ? "Chậm"
                      : flight.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat & Baggage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Luggage className="w-5 h-5" />
                Ghế ngồi & Hành lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Số ghế</p>
                  <p className="text-2xl font-bold">{booking.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạng vé</p>
                  <p className="font-semibold">
                    {booking.seatClass === "first"
                      ? "Hạng Nhất"
                      : booking.seatClass === "business"
                      ? "Thương Gia"
                      : "Phổ Thông"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá vé</p>
                  <p className="font-semibold">{formatCurrency(booking.price)}</p>
                </div>
              </div>

              {booking.baggage && (
                <>
                  <Separator />
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Hành lý xách tay</p>
                      <p className="font-semibold">{booking.baggage.carryOn} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hành lý ký gửi</p>
                      <p className="font-semibold">{booking.baggage.checked} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phí vượt mức</p>
                      <p className="font-semibold">
                        {formatCurrency(booking.baggage.extraFee)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!booking && (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Nhập thông tin để tìm kiếm hành khách</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
