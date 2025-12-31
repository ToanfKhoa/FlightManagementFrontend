import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, Check, Plane, CreditCard } from "lucide-react";
import { Booking, formatCurrency, mockBookings } from "../../lib/mockData";
import { toast } from "sonner";
import { Flight } from "../../types/flightType"
import { BookingRequest, BookingResponse } from "../../types/ticketType";
import ticketService from "../../services/ticketService";

interface Props {
  flight: Flight;
  userId: string;
  onBack: () => void;
}

export function SeatClassSelection({ flight, userId, onBack }: Props) {
  const [selectedClass, setSelectedClass] = useState<"BUSINESS" | "FIRST_CLASS" | "ECONOMY" | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passengerName, setPassengerName] = useState("Nguyễn Văn A");
  const [passengerEmail, setPassengerEmail] = useState("nguyen.a@example.com");
  const [passengerPhone, setPassengerPhone] = useState("0912345678");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  if (!flight.prices) {
    flight.prices = {
      economy: 1500000,
      business: 2500000,
      first: 4000000
    };
  }
  if (!flight.availableSeats) {
    flight.availableSeats = {
      economy: 150,
      business: 50,
      first: 40
    };
  }

  const priceFor = (c: string) =>
    c === "first"
      ? flight.prices!.first
      : c === "business"
        ? flight.prices!.business
        : flight.prices!.economy;

  const startBooking = (c: 'BUSINESS' | 'FIRST_CLASS' | 'ECONOMY') => {
    setSelectedClass(c);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedClass) return;
    setIsProcessing(true);

    try {
      const bookingData: BookingRequest = {
        flightId: flight.id,
        seatClass: selectedClass
      };

      const response: BookingResponse = await ticketService.booking(bookingData);

      // Giả sử response có ticketCode hoặc id
      setTicketCode(`ID${response.id}`);
      setBookingComplete(true);
      toast.success("Đặt vé thành công!");
    } catch (error) {
      toast.error("Lỗi khi đặt vé. Vui lòng thử lại.");
      console.error("Booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle>Đặt vé thành công!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Mã vé</p>
              <p className="text-2xl font-mono font-bold">{ticketCode}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Chuyến bay</p>
                <p className="font-semibold">{flight.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hạng vé</p>
                <p className="font-semibold">{selectedClass}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giá vé</p>
                <p className="font-semibold">{formatCurrency(priceFor(selectedClass || "economy"))}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => window.location.reload()}>
                Thanh toán ngay
              </Button>
              <Button variant="outline" onClick={onBack}>
                Về trang tìm kiếm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConfirmation && selectedClass) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowConfirmation(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h2>Xác nhận đặt vé - {selectedClass}</h2>
        </div>

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
              <div>
                <p className="text-sm text-gray-600">Tuyến</p>
                <p className="font-semibold">{flight.route.origin} → {flight.route.destination}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin hành khách</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" type="tel" value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Giá vé</span>
              <span className="font-semibold">{formatCurrency(priceFor(selectedClass))}</span>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" size="lg" onClick={handleConfirmBooking} disabled={isProcessing || !passengerName || !passengerEmail || !passengerPhone}>
                {isProcessing ? "Đang xử lý..." : "Xác nhận đặt vé"}
              </Button>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>Quay lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h2>Chọn hạng ghế - {flight.id}</h2>
          <p className="text-sm text-gray-600">{flight.route.origin} → {flight.route.destination}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {flight.prices.first > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  <Badge variant="default">Hạng Nhất</Badge>
                </CardTitle>
                <span>{formatCurrency(flight.prices.first)}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Số ghế còn: {flight.availableSeats.first}</p>
              <Button onClick={() => startBooking("FIRST_CLASS")}>Chọn hạng</Button>
            </CardContent>
          </Card>
        )}

        {flight.prices.business > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  <Badge variant="secondary">Thương Gia</Badge>
                </CardTitle>
                <span>{formatCurrency(flight.prices.business)}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Số ghế còn: {flight.availableSeats.business}</p>
              <Button onClick={() => startBooking("BUSINESS")}>Chọn hạng</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                <Badge variant="outline">Phổ Thông</Badge>
              </CardTitle>
              <span>{formatCurrency(flight.prices.economy)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Số ghế còn: {flight.availableSeats.economy}</p>
            <Button onClick={() => startBooking("ECONOMY")}>Chọn hạng</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SeatClassSelection;
