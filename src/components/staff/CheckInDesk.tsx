import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Search, Check, QrCode, Download } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import type { Ticket } from "../../types/ticketType";
import type { Flight, FlightSeatResponse } from "../../types/flightType";
import type { Seat } from "../../types/seatType";
import { ticketService } from "../../services/ticketService";

export function CheckInDesk() {
  const [ticketCode, setTicketCode] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [availableSeats, setAvailableSeats] = useState<FlightSeatResponse[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleSearch = async () => {
    try {
      const foundTicket = await ticketService.getTicketById(parseInt(ticketCode));

      if (!foundTicket) {
        toast.error("Không tìm thấy vé");
        return;
      }

      if (foundTicket.status.toString() === "CANCELED") {
        toast.error("Vé đã bị hủy");
        return;
      }

      if (foundTicket.status !== "PAID") {
        toast.error("Vé chưa được thanh toán");
        return;
      }

      const foundFlight = foundTicket.flight;
      if (!foundFlight) {
        toast.error("Không tìm thấy thông tin chuyến bay");
        return;
      }

      setTicket(foundTicket);
      setFlight(foundFlight);
      setShowBoardingPass(false);
      if (foundTicket.seat) {
        setCheckedIn(true);
      }

      // Fetch available seats for the flight
      try {
        const seats = foundFlight.flightSeats;

        const availableEconomySeats = seats.filter((seat) =>
          seat.seatClass === ticket?.ticketClass && seat.status === 'AVAILABLE'
        );

        setAvailableSeats(availableEconomySeats);
      } catch (error) {
        console.error("Error fetching seats:", error);
        toast.error("Không thể tải danh sách ghế");
      }

      toast.success("Tìm thấy vé!");
    } catch (error) {
      toast.error("Không tìm thấy vé");
      console.error(error);
    }
  };

  const handleCheckIn = async () => {
    if (!ticket || !selectedSeatId) return;
    console.log("Checking in ticket:", ticket.id, "with seat:", selectedSeatId);
    try {
      console.log(ticket.id, selectedSeatId);
      await ticketService.checkin(
        ticket.flight.id,
        ticket.id,
        selectedSeatId
      );
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
  const handleSeatClick = (seat: FlightSeatResponse) => {
    if (seat.status !== "AVAILABLE") return;
    setSelectedSeatId(seat.id);
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
              setTicketCode("");

              setAvailableSeats([]);
              setSelectedSeatId(null);

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
                onChange={(e) => setTicketCode(e.target.value)}
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

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {ticket.flight.flightSeats.map((seat) => {
              const isAvailable = seat.status === "AVAILABLE";
              const isSelected = selectedSeatId === seat.id;

              if (!checkedIn)
                return (
                  <button
                    key={seat.id}
                    disabled={!isAvailable}
                    onClick={() => handleSeatClick(seat)}
                    className={`
                relative h-12 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center
                ${/* Style cho ghế ĐÃ ĐẶT (Xám, không click được) */ ""}
                ${!isAvailable
                        ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
                        : ""}
                
                ${/* Style cho ghế ĐANG CHỌN (Xanh đậm, nổi bật) */ ""}
                ${isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105 z-10"
                        : ""}

                ${/* Style cho ghế TRỐNG (Trắng, viền xanh nhạt) */ ""}
                ${isAvailable && !isSelected
                        ? "bg-white border-blue-100 text-blue-600 hover:border-blue-400 hover:bg-blue-50"
                        : ""}
              `}
                  >
                    {/* Nội dung nút */}
                    <div className="flex flex-col items-center leading-none">
                      <span>{seat.id}</span>
                    </div>
                  </button>
                );
            })}
          </div>



          {/* 4. Chú thích (Legend) - Rất quan trọng để user hiểu */}
          {!checkedIn && (
            <div className="flex justify-center gap-4 text-xs text-gray-600 pt-2 border-t">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 border-2 border-blue-100 bg-white rounded"></div>
                <span>Còn trống</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Đã đặt</span>
              </div>
            </div>
          )}

          {/* 5. Hiển thị kết quả chọn */}
          {selectedSeatId && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-center font-medium animate-in fade-in slide-in-from-bottom-2">
              {checkedIn ? "Mã ghế của bạn là" : "Bạn đang chọn ghế"}: {ticket.flight.flightSeats.find(s => s.id === selectedSeatId)?.id}
            </div>
          )}

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
