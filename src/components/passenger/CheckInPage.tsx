import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Search, Check, Calendar, Clock, Plane, QrCode, Download } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import type { Ticket } from "../../types/ticketType";
import type { Flight } from "../../types/flightType";
import { ticketService } from "../../services/ticketService";
import { flightService } from "../../services/flightService";

interface CheckInPageProps {
  userId: number;
}

export function CheckInPage({ userId }: CheckInPageProps) {
  const [ticketCode, setTicketCode] = useState<number | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [carryOnWeight, setCarryOnWeight] = useState(5);
  const [checkedWeight, setCheckedWeight] = useState(15);

  const handleSearch = async () => {
    try {
      if (!ticketCode) {
        toast.error("Vui lòng nhập mã vé");
        return;
      }
      const foundTicket = await ticketService.getTicketById(ticketCode);

      if (!foundTicket) {
        toast.error("Không tìm thấy vé");
        return;
      }

      if (foundTicket.status === "CANCELED") {
        toast.error("Vé đã bị hủy");
        return;
      }

      if (foundTicket.status !== "PAID" && foundTicket.status !== "CHANGED") { // assuming checked-in is CHANGED or something
        toast.error("Vé chưa được thanh toán");
        return;
      }

      const foundFlight = await flightService.getById(foundTicket.flight.id.toString());

      if (!foundFlight) {
        toast.error("Không tìm thấy thông tin chuyến bay");
        return;
      }

      // Check if check-in is available (48h - 2h before departure)
      const flightDate = new Date(foundFlight.data.departureTime);
      const now = new Date();
      const hoursDiff = (flightDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 48) {
        toast.error("Check-in chỉ khả dụng từ 48 giờ trước giờ khởi hành");
        return;
      }

      if (hoursDiff < 2) {
        toast.error("Check-in đã đóng (2 giờ trước giờ khởi hành)");
        return;
      }

      setTicket(foundTicket);
      setFlight(foundFlight.data);
      toast.success("Tìm thấy vé!");
    } catch (error) {
      toast.error("Lỗi khi tìm vé");
      console.error(error);
    }
  };

  const handleCheckIn = async () => {
    if (!ticket) return;

    try {
      await ticketService.checkin(ticket.id, {
        passengerEmail: carryOnWeight,
        seatID: checkedWeight,
      });
      setCheckedIn(true);
      toast.success("Check-in thành công!");
    } catch (error) {
      toast.error("Lỗi khi check-in");
      console.error(error);
    }
  };

  const handleDownloadBoardingPass = () => {
    toast.success("Đang tải thẻ lên máy bay...");
  };

  if (checkedIn && ticket && flight) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle>Check-in thành công!</CardTitle>
            <CardDescription>
              Bạn đã hoàn tất thủ tục check-in. Vui lòng có mặt tại cổng lên máy bay trước
              30 phút.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Boarding Pass */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="mb-1">THẺ LÊN MÁY BAY</h3>
                  <p className="text-sm text-gray-600">BOARDING PASS</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <QrCode className="w-12 h-12" />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Hành khách</p>
                  <p className="font-bold">{ticket.passenger.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã chuyến bay</p>
                  <p className="font-bold">{flight.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày bay</p>
                  <p className="font-bold">
                    {new Date(flight.departureTime).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ khởi hành</p>
                  <p className="font-bold">{flight.departureTime.split('T')[1]?.substring(0, 5)}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cổng</p>
                  <p className="text-2xl font-bold">A12</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ghế</p>
                  <p className="text-2xl font-bold">{ticket.seat.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạng</p>
                  <p className="font-bold">
                    {ticket.seat.seatClass === "FIRST_CLASS"
                      ? "First"
                      : ticket.seat.seatClass === "BUSINESS"
                        ? "Business"
                        : "Economy"}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="text-center text-sm text-gray-600">
                <p>Vui lòng có mặt tại cổng lên máy bay trước 30 phút</p>
                <p className="font-mono mt-2">{ticket.id}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleDownloadBoardingPass}>
                <Download className="w-4 h-4 mr-2" />
                Tải thẻ lên máy bay (PDF)
              </Button>
              <Button variant="outline" onClick={() => setCheckedIn(false)}>
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ticket && flight) {
    const limits = {
      carryOn: 7,
      checked: {
        ECONOMY: 20,
        BUSINESS: 30,
        FIRST_CLASS: 40,
      },
    };

    const allowedChecked = limits.checked[ticket.seat.seatClass];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => setTicket(null)}>
          Tìm vé khác
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin chuyến bay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Chuyến bay</p>
                  <p className="font-semibold">{flight.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Ngày bay</p>
                  <p className="font-semibold">
                    {new Date(flight.departureTime).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Giờ khởi hành</p>
                  <p className="font-semibold">{flight.departureTime.split('T')[1]?.substring(0, 5)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tuyến đường</p>
                <p className="font-semibold">{flight.route.origin} - {flight.route.destination}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Số ghế</p>
                <p className="text-2xl font-bold">{ticket.seat.seatNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hạng vé</p>
                <p className="font-semibold">
                  {ticket.seat.seatClass === "FIRST_CLASS"
                    ? "Hạng Nhất"
                    : ticket.seat.seatClass === "BUSINESS"
                      ? "Thương Gia"
                      : "Phổ Thông"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khai báo hành lý</CardTitle>
            <CardDescription>
              Vui lòng khai báo trọng lượng hành lý của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carryOn">
                Hành lý xách tay (kg) - Cho phép: {limits.carryOn} kg
              </Label>
              <Input
                id="carryOn"
                type="number"
                min="0"
                max="20"
                value={carryOnWeight}
                onChange={(e) => setCarryOnWeight(Number(e.target.value))}
              />
              {carryOnWeight > limits.carryOn && (
                <p className="text-sm text-red-600">
                  Vượt quá {carryOnWeight - limits.carryOn} kg
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checked">
                Hành lý ký gửi (kg) - Cho phép: {allowedChecked} kg
              </Label>
              <Input
                id="checked"
                type="number"
                min="0"
                max="100"
                value={checkedWeight}
                onChange={(e) => setCheckedWeight(Number(e.target.value))}
              />
              {checkedWeight > allowedChecked && (
                <p className="text-sm text-red-600">
                  Vượt quá {checkedWeight - allowedChecked} kg - Phí thêm sẽ được tính tại
                  quầy hành lý
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
              <p className="text-blue-800">
                💡 Phí hành lý vượt mức: 100,000đ / 5 kg (làm tròn lên)
              </p>
            </div>

            <Button className="w-full" onClick={handleCheckIn}>
              Hoàn tất Check-in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Check-in trực tuyến</CardTitle>
          <CardDescription>
            Check-in có sẵn từ 48 giờ đến 2 giờ trước giờ khởi hành
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticketCode">Mã vé</Label>
            <div className="flex gap-2">
              <Input
                id="ticketCode"
                placeholder="123456789"
                value={ticketCode?.toString() || ""}
                onChange={(e) => setTicketCode(parseInt(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Tìm
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold">Lưu ý:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Check-in chỉ khả dụng từ 48 giờ trước giờ khởi hành</li>
              <li>Check-in đóng cửa 2 giờ trước giờ khởi hành</li>
              <li>Vui lòng có mặt tại cổng lên máy bay trước 30 phút</li>
              <li>Mang theo giấy tờ tùy thân hợp lệ</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
