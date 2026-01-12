import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Calendar, Clock, Plane, Ticket, AlertCircle, CheckCircle2 } from "lucide-react";
import { mockBookings, mockFlights, formatCurrency, getTimeRemaining } from "../../lib/mockData";
import { toast } from "sonner";
import type { Booking, Flight } from "../../lib/mockData";

interface MyBookingsProps {
  userId: number;
}

export function MyBookings({ userId }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);

  useEffect(() => {
    const userBookings = mockBookings.filter((b) => b.passengerId === userId);
    setBookings(userBookings);
  }, [userId]);

  const getFlight = (flightId: string): Flight | undefined => {
    return mockFlights.find((f) => f.id === flightId);
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

  const handlePayment = (booking: Booking) => {
    toast.success("Chuyển đến trang thanh toán...");
    setTimeout(() => {
      booking.status = "paid";
      setBookings([...bookings]);
      toast.success("Thanh toán thành công!");
    }, 1500);
  };

  const handleCheckIn = () => {
    if (selectedBooking) {
      selectedBooking.status = "checked-in";
      setBookings([...bookings]);
      setShowCheckInDialog(false);
      toast.success("Check-in thành công! Vui lòng đến cổng lên máy bay đúng giờ.");
      setSelectedBooking(null);
    }
  };

  const canCheckIn = (booking: Booking, flight: Flight): boolean => {
    // Can only check-in if status is "paid"
    if (booking.status !== "paid") return false;

    // Check if flight date is within 24 hours
    const flightDateTime = new Date(`${flight.date}T${flight.departureTime}`);
    const now = new Date();
    const hoursUntilFlight = (flightDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can check-in 24 hours before and up to departure time
    return hoursUntilFlight <= 24 && hoursUntilFlight > 0;
  };

  const getCheckInMessage = (booking: Booking, flight: Flight): string => {
    if (booking.status !== "paid") {
      return "Vui lòng thanh toán trước khi check-in";
    }

    const flightDateTime = new Date(`${flight.date}T${flight.departureTime}`);
    const now = new Date();
    const hoursUntilFlight = (flightDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilFlight > 24) {
      return `Check-in mở cửa từ 24h trước giờ bay (còn ${Math.floor(hoursUntilFlight)} giờ)`;
    }
    if (hoursUntilFlight <= 0) {
      return "Chuyến bay đã khởi hành";
    }
    return "";
  };

  const handleCancelBooking = () => {
    if (selectedBooking) {
      const flight = getFlight(selectedBooking.flightId);

      selectedBooking.status = "canceled";
      setBookings([...bookings]);
      setShowCancelDialog(false);

      // Notify waiting list if flight exists and has waiting list
      if (flight && flight.waitingList && flight.waitingList.length > 0) {
        const firstWaiting = flight.waitingList[0];
        if (firstWaiting && !firstWaiting.notified) {
          firstWaiting.notified = true;
          toast.success(
            `Đã hủy vé. Đã thông báo cho ${firstWaiting.passengerName} trong danh sách chờ.`,
            { duration: 5000 }
          );
        }
      } else {
        toast.success("Vé đã được hủy");
      }

      setSelectedBooking(null);
    }
  };

  const handleRefund = () => {
    if (selectedBooking) {
      const refundAmount = selectedBooking.price * 0.8; // 80% refund
      const flight = getFlight(selectedBooking.flightId);

      selectedBooking.status = "canceled";
      setBookings([...bookings]);
      setShowRefundDialog(false);

      // Notify waiting list if flight exists and has waiting list
      if (flight && flight.waitingList && flight.waitingList.length > 0) {
        const firstWaiting = flight.waitingList[0];
        if (firstWaiting && !firstWaiting.notified) {
          firstWaiting.notified = true;
          toast.success(
            `Hoàn tiền ${formatCurrency(refundAmount)} thành công! Đã thông báo cho người trong danh sách chờ.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`Hoàn tiền ${formatCurrency(refundAmount)} thành công!`);
        }
      } else {
        toast.success(`Hoàn tiền ${formatCurrency(refundAmount)} thành công!`);
      }

      setSelectedBooking(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2">Chưa có vé nào</h3>
          <p className="text-gray-600 mb-4">
            Bạn chưa đặt vé nào. Hãy tìm kiếm chuyến bay để đặt vé.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>Vé của tôi</h2>
        <Badge variant="secondary">{bookings.length} vé</Badge>
      </div>

      {bookings.map((booking) => {
        const flight = getFlight(booking.flightId);
        if (!flight) return null;

        const timeRemaining = getTimeRemaining(booking.paymentDeadline);
        const showPaymentWarning =
          booking.status === "reserved" && !timeRemaining.expired;

        return (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {booking.flightCode}
                    {getStatusBadge(booking.status)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Mã vé: {booking.ticketCode}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{booking.seatNumber}</p>
                  <p className="text-sm text-gray-600">
                    {booking.seatClass === "first"
                      ? "Hạng Nhất"
                      : booking.seatClass === "business"
                        ? "Thương Gia"
                        : "Phổ Thông"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tuyến đường</p>
                    <p className="font-semibold">{flight.route}</p>
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
                  <p className="text-sm text-gray-600">Giá vé</p>
                  <p className="font-semibold">{formatCurrency(booking.price)}</p>
                </div>
              </div>

              {showPaymentWarning && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800">
                      Vui lòng thanh toán trong vòng{" "}
                      <span className="font-bold">
                        {timeRemaining.hours} giờ {timeRemaining.minutes} phút
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                {booking.status === "reserved" && (
                  <>
                    <Button onClick={() => handlePayment(booking)}>
                      Thanh toán ngay
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelDialog(true);
                      }}
                    >
                      Hủy vé
                    </Button>
                  </>
                )}

                {booking.status === "paid" && (
                  <>
                    {canCheckIn(booking, flight) ? (
                      <Button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCheckInDialog(true);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Check-in
                      </Button>
                    ) : (
                      <div className="w-full">
                        <Button variant="outline" disabled className="w-full">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Check-in
                        </Button>
                        <p className="text-xs text-gray-600 mt-1">
                          {getCheckInMessage(booking, flight)}
                        </p>
                      </div>
                    )}
                    <Button variant="outline">Đổi vé</Button>
                    <Button variant="outline">Nâng hạng</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRefundDialog(true);
                      }}
                    >
                      Hoàn tiền
                    </Button>
                  </>
                )}

                {booking.status === "checked-in" && (
                  <Button>Xem thẻ lên máy bay</Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy vé</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy vé này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Đóng
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Xác nhận hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn tiền vé</DialogTitle>
            <DialogDescription>
              Bạn sẽ nhận lại 80% giá trị vé. Số tiền hoàn lại sẽ được chuyển trong
              vòng 7-10 ngày làm việc.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Giá vé gốc:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedBooking.price)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Số tiền hoàn lại (80%):</span>
                <span className="font-bold">
                  {formatCurrency(selectedBooking.price * 0.8)}
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleRefund}>Xác nhận hoàn tiền</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in vé</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn check-in vé này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Giá vé gốc:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedBooking.price)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Trạng thái:</span>
                <span className="font-bold">
                  {getStatusBadge(selectedBooking.status)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Thông báo:</span>
                <span className="font-bold">
                  {getCheckInMessage(selectedBooking, getFlight(selectedBooking.flightId) as Flight)}
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
              Đóng
            </Button>
            <Button onClick={handleCheckIn}>Xác nhận check-in</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}