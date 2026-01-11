import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { ArrowLeft, Check, Calendar, Clock, Plane, CreditCard } from "lucide-react";
import { formatCurrency, mockBookings } from "../../lib/mockData";
import { toast } from "sonner";
import type { Flight, Seat, Booking } from "../../lib/mockData";

interface BookingConfirmationProps {
  flight: Flight;
  seat: Seat;
  userId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function BookingConfirmation({
  flight,
  seat,
  userId,
  onBack,
  onComplete,
}: BookingConfirmationProps) {
  const [passengerName, setPassengerName] = useState("Nguyễn Văn A");
  const [passengerEmail, setPassengerEmail] = useState("nguyen.a@example.com");
  const [passengerPhone, setPassengerPhone] = useState("0912345678");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  const handleConfirmBooking = () => {
    setIsProcessing(true);

    // Simulate API call
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
        seatNumber: seat.seatNumber,
        seatClass: seat.class,
        status: "reserved",
        bookingDate: new Date().toISOString(),
        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        price: seat.price,
      };

      mockBookings.push(newBooking);

      setIsProcessing(false);
      setBookingComplete(true);
      toast.success("Đặt vé thành công!");
    }, 1500);
  };

  const handlePayNow = () => {
    // Simulate payment
    toast.success("Chuyển đến trang thanh toán...");
    setTimeout(() => {
      onComplete();
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
            <CardDescription>
              Vé của bạn đã được đặt. Vui lòng thanh toán trong vòng 24 giờ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Mã vé</p>
              <p className="text-2xl font-mono font-bold">{ticketCode}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Chuyến bay</p>
                <p className="font-semibold">{flight.flightCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số ghế</p>
                <p className="font-semibold">{seat.seatNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hạng vé</p>
                <p className="font-semibold">
                  {seat.class === "first"
                    ? "Hạng Nhất"
                    : seat.class === "business"
                      ? "Thương Gia"
                      : "Phổ Thông"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giá vé</p>
                <p className="font-semibold">{formatCurrency(seat.price)}</p>
              </div>
            </div>

            <Separator />

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Vui lòng thanh toán trong vòng 24 giờ để giữ chỗ. Sau thời gian này,
                vé sẽ tự động bị hủy.
              </p>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handlePayNow}>
                <CreditCard className="w-4 h-4 mr-2" />
                Thanh toán ngay
              </Button>
              <Button variant="outline" onClick={onComplete}>
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h2>Xác nhận đặt vé</h2>
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
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Ngày bay</p>
                <p className="font-semibold">
                  {new Date(flight.date).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Giờ khởi hành</p>
                <p className="font-semibold">{flight.departureTime}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tuyến đường</p>
              <p className="font-semibold">{flight.route}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Số ghế</p>
              <p className="text-2xl font-bold">{seat.seatNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hạng vé</p>
              <p className="text-xl font-semibold">
                {seat.class === "first"
                  ? "Hạng Nhất"
                  : seat.class === "business"
                    ? "Thương Gia"
                    : "Phổ Thông"}
              </p>
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
            <Input
              id="name"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={passengerEmail}
              onChange={(e) => setPassengerEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
              required
            />
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
            <span className="font-semibold">{formatCurrency(seat.price)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-bold">Tổng cộng</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(seat.price)}
            </span>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleConfirmBooking}
            disabled={isProcessing || !passengerName || !passengerEmail || !passengerPhone}
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận đặt vé"}
          </Button>

          <p className="text-sm text-gray-600 text-center">
            Sau khi đặt vé, bạn có 24 giờ để thanh toán
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
