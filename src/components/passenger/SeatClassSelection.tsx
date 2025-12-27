import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, Check, Plane, CreditCard } from "lucide-react";
import { formatCurrency, mockBookings } from "../../lib/mockData";
import { toast } from "sonner@2.0.3";
import type { Flight, Booking } from "../../lib/mockData";

interface Props {
  flight: Flight;
  userId: string;
  onBack: () => void;
}

export function SeatClassSelection({ flight, userId, onBack }: Props) {
  const [selectedClass, setSelectedClass] = useState<"economy" | "business" | "first" | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passengerName, setPassengerName] = useState("Nguyễn Văn A");
  const [passengerEmail, setPassengerEmail] = useState("nguyen.a@example.com");
  const [passengerPhone, setPassengerPhone] = useState("0912345678");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  const priceFor = (c: string) =>
    c === "first"
      ? flight.prices.first
      : c === "business"
      ? flight.prices.business
      : flight.prices.economy;

  const startBooking = (c: "economy" | "business" | "first") => {
    setSelectedClass(c);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedClass) return;
    setIsProcessing(true);

    setTimeout(() => {
      const code = "TK" + Math.random().toString().slice(2, 11);
      setTicketCode(code);

      const newBooking: Booking = {
        id: "b" + Date.now(),
        ticketCode: code,
        passengerId: userId,
        passengerName,
        flightId: flight.id,
        flightCode: flight.flightCode,
        seatNumber: `AUTO-${selectedClass.toUpperCase()}-${Date.now()}`,
        seatClass: selectedClass,
        status: "reserved",
        bookingDate: new Date().toISOString(),
        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        price: priceFor(selectedClass),
      };

      mockBookings.push(newBooking);

      setIsProcessing(false);
      setBookingComplete(true);
      toast.success("Đặt vé thành công!");
    }, 1000);
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
                <p className="font-semibold">{flight.flightCode}</p>
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
                  <p className="font-semibold">{flight.flightCode}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tuyến</p>
                <p className="font-semibold">{flight.route}</p>
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
          <h2>Chọn hạng ghế - {flight.flightCode}</h2>
          <p className="text-sm text-gray-600">{flight.route}</p>
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
              <Button onClick={() => startBooking("first")}>Chọn hạng</Button>
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
              <Button onClick={() => startBooking("business")}>Chọn hạng</Button>
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
            <Button onClick={() => startBooking("economy")}>Chọn hạng</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SeatClassSelection;
