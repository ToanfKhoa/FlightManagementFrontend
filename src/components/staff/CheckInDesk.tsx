import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Search, Check, QrCode, Download } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import type { Ticket } from "../../types/ticketType";
import type { Flight } from "../../types/flightType";
import { ticketService } from "../../services/ticketService";
import { flightService } from "../../services/flightService";

export function CheckInDesk() {
  const [ticketCode, setTicketCode] = useState<number>(0);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleSearch = async () => {
    try {
      const foundTicket = await ticketService.getTicketById(ticketCode);

      if (!foundTicket) {
        toast.error("Không tìm thấy vé");
        return;
      }

      if (foundTicket.status === "CANCELED") {
        toast.error("Vé đã bị hủy");
        return;
      }

      if (foundTicket.status !== "PAID") {
        toast.error("Vé chưa được thanh toán");
        return;
      }

      const foundFlight = await flightService.getById(foundTicket.flight.id.toString());

      if (!foundFlight) {
        toast.error("Không tìm thấy thông tin chuyến bay");
        return;
      }

      setTicket(foundTicket);
      setFlight(foundFlight.data);
      setShowBoardingPass(false);
      toast.success("Tìm thấy vé!");
    } catch (error) {
      toast.error("Lỗi khi tìm vé");
      console.error(error);
    }
  };

  const handleCheckIn = async () => {
    if (!ticket) return;

    try {
      await ticketService.checkin({
        ticketId: ticket.id,
        passengerEmail: ticket.passenger.accountRequest.email,
        seatId: ticket.seat.id
      });
      setCheckedIn(true);
      setShowBoardingPass(true);
      toast.success("Check-in thành công!");
    } catch (error) {
      toast.error("Lỗi khi check-in");
      console.error(error);
    }
  };

  const handlePrintBoardingPass = () => {
    toast.success("Đang in thẻ lên máy bay...");
  };

  if (showBoardingPass && ticket && flight) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2>Thẻ lên máy bay</h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowBoardingPass(false);
              setTicket(null);
              setFlight(null);
              setTicketCode(0);
              setCheckedIn(false);
            }}
          >
            Hoàn tất
          </Button>
        </div>

        <Card className="border-green-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle>Check-in thành công!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Boarding Pass */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl mb-1">THẺ LÊN MÁY BAY</h3>
                  <p className="text-sm text-gray-600">BOARDING PASS</p>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <QrCode className="w-16 h-16" />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hành khách / Passenger</p>
                  <p className="text-xl font-bold">{ticket.passenger.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Chuyến bay / Flight</p>
                  <p className="text-xl font-bold">{flight.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày bay / Date</p>
                  <p className="font-bold">
                    {new Date(flight.departureTime).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Giờ khởi hành / Departure Time
                  </p>
                  <p className="font-bold">{flight.departureTime.split('T')[1]?.substring(0, 5)}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cổng / Gate</p>
                  <p className="text-3xl font-bold">A12</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ghế / Seat</p>
                  <p className="text-3xl font-bold">{ticket.seat.seatNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Hạng / Class</p>
                  <p className="text-xl font-bold">
                    {ticket.seat.seatClass === "FIRST_CLASS"
                      ? "First Class"
                      : ticket.seat.seatClass === "BUSINESS"
                        ? "Business"
                        : "Economy"}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Vui lòng có mặt tại cổng lên máy bay trước 30 phút
                </p>
                <p className="text-sm text-gray-600">
                  Please arrive at the gate 30 minutes before departure
                </p>
                <p className="font-mono text-lg mt-4">{ticket.id}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handlePrintBoardingPass}>
                <Download className="w-4 h-4 mr-2" />
                In thẻ lên máy bay
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBoardingPass(false);
                  setTicket(null);
                  setFlight(null);
                  setTicketCode(0);
                  setCheckedIn(false);
                }}
              >
                Hoàn tất
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quầy Check-in</CardTitle>
          <CardDescription>Nhập mã vé để thực hiện check-in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="ticketCode" className="sr-only">
                Mã vé
              </Label>
              <Input
                id="ticketCode"
                placeholder="123456789"
                value={ticketCode}
                onChange={(e) => setTicketCode(parseInt(e.target.value))}
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

      {ticket && flight && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hành khách</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-semibold text-lg">{ticket.passenger.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã vé</p>
                  <p className="font-mono font-semibold">{ticket.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <Badge variant={checkedIn ? "default" : "secondary"}>
                    {checkedIn ? "Đã check-in" : "Đã thanh toán"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin chuyến bay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Chuyến bay</p>
                  <p className="font-semibold text-lg">{flight.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tuyến đường</p>
                  <p className="font-semibold">{flight.route.origin} - {flight.route.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày bay</p>
                  <p className="font-semibold">
                    {new Date(flight.departureTime).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ khởi hành</p>
                  <p className="font-semibold text-lg">{flight.departureTime.split('T')[1]?.substring(0, 5)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin ghế</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Số ghế</p>
                  <p className="text-3xl font-bold">{ticket.seat.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạng</p>
                  <p className="font-semibold">
                    {ticket.seat.seatClass === "FIRST_CLASS"
                      ? "Hạng Nhất"
                      : ticket.seat.seatClass === "BUSINESS"
                        ? "Thương Gia"
                        : "Phổ Thông"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá vé</p>
                  <p className="font-semibold">{formatCurrency(ticket.price)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!checkedIn && (
            <Button className="w-full" size="lg" onClick={handleCheckIn}>
              <Check className="w-4 h-4 mr-2" />
              Xác nhận Check-in
            </Button>
          )}

          {checkedIn && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-800">Hành khách đã check-in</p>
            </div>
          )}
        </>
      )}

      {!ticket && (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Nhập mã vé để bắt đầu check-in</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
