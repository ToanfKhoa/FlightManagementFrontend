import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, Check, Plane, CreditCard } from "lucide-react";
import { Booking, formatCurrency, mockBookings } from "../../lib/mockData";
import { toast } from "sonner";
import { Flight } from "../../types/flightType"
import { BookingRequest, BookingResponse, PaymentRequest } from "../../types/ticketType";
import ticketService from "../../services/ticketService";
import { SeatClass } from "../../types/seatType";
import { useAuth } from "../../context/AuthContext";

interface Props {
  flight: Flight;
  userId: number;
  onBack: () => void;
}

export function SeatClassSelection({ flight, userId, onBack }: Props) {
  const { user, passenger } = useAuth();
  const [selectedClass, setSelectedClass] = useState<SeatClass | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);

  const seatData = useMemo(() => {
    if (!flight) return {};

    const prices = flight.flightSeats.reduce((acc, seat) => {
      acc[seat.seatClass] = seat.price;
      return acc;
    }, {} as Record<string, number>);

    const availability = flight.seatSummary.reduce((acc, item) => {
      acc[item.seatClass] = item.availableSeats;
      return acc;
    }, {} as Record<string, number>);

    return { prices, availability };
  }, [flight]);

  const SEAT_CONFIG = [
    {
      key: 'ECONOMY',
      label: 'Phổ Thông',
      variant: 'outline',
      bg: 'bg-blue-50'
    },
    {
      key: 'BUSINESS',
      label: 'Thương Gia',
      variant: 'secondary',
      bg: 'bg-purple-50'
    },
    {
      key: 'FIRST_CLASS',
      label: 'Hạng Nhất',
      variant: 'default',
      bg: 'bg-yellow-50'
    }
  ];

  const startBooking = (c: SeatClass) => {
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

      const response = await ticketService.booking(bookingData);
      if (!response || !response.id) {
        throw new Error("Invalid booking response");
      }
      else {
        setBookingResponse(response);
        setBookingComplete(true);
        toast.success("Đặt vé thành công!");
      }


    } catch (error) {
      toast.error("Lỗi khi đặt vé. Vui lòng thử lại.");
      console.error("Booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingResponse?.id) return;
    try {
      const paymentData: PaymentRequest = {
        paymentMethod: 'VNPAY',
        returnUrl: window.location.origin + '/passenger',
        cancelUrl: window.location.origin + '/passenger'
      };
      const paymentResponse = await ticketService.pay(bookingResponse.id, paymentData);
      if (paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      }
    } catch (error) {
      toast.error("Lỗi khi thanh toán. Vui lòng thử lại.");
      console.error("Payment error:", error);
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
              <p className="text-2xl font-mono font-bold">{bookingResponse?.id}</p>
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
                <p className="font-semibold">{formatCurrency(bookingResponse?.price || 0)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handlePayment}>
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
    const currentPrice = seatData.prices?.[selectedClass] || 0;
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
              <Input id="name" value={passenger?.fullName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" type="tel" value={user?.phone} />
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
              <span className="font-semibold">{formatCurrency(currentPrice || 0)}</span>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" size="lg" onClick={handleConfirmBooking} disabled={isProcessing || !passenger?.fullName || !user?.email || !user?.phone}>
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
        {SEAT_CONFIG.map((config) => {
          const price = seatData.prices?.[config.key] || 0;
          const available = seatData.availability?.[config.key] || 0;

          // Chỉ hiển thị nếu có giá và còn chỗ (theo logic của bạn)
          if (price === 0 || available <= 0) return null;

          return (
            <Card key={config.key} className={`${config.bg} border-2 hover:border-primary transition-all`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>
                    <Badge variant={config.variant as any} className="text-sm">
                      {config.label}
                    </Badge>
                  </CardTitle>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(price)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  Số ghế còn: <span className="font-medium text-black">{available}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => startBooking(config.key as SeatClass)}
                >
                  Chọn {config.label}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SeatClassSelection;
