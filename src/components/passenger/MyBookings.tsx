import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Calendar, Clock, Plane, Ticket as TicketIcon, AlertCircle, CheckCircle2, CreditCard, ArrowLeft } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import type { Ticket, PaymentRequest, BookingRequest } from "../../types/ticketType";
import { ticketService } from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";

interface MyBookingsProps {
  userId: number;
}

export function MyBookings({ userId }: MyBookingsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getOwnTickets({ page: 0, size: 100, sort: [] });
        setTickets(response.content);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Không thể tải danh sách vé');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      RESERVED: { variant: "secondary", label: "Đang giữ chỗ" },
      PAID: { variant: "default", label: "Đã thanh toán" },
      CANCELED: { variant: "destructive", label: "Đã hủy" },
      CHANGED: { variant: "default", label: "Đã đổi" },
    };

    return (
      <Badge variant={statusMap[status]?.variant as any}>{statusMap[status]?.label || status}</Badge>
    );
  };

  const handlePayment = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTicket?.id) return;
    try {
      const paymentData: PaymentRequest = {
        paymentMethod: 'VNPAY',
        returnUrl: window.location.origin + '/passenger',
        cancelUrl: window.location.origin + '/passenger'
      };
      const paymentResponse = await ticketService.pay(selectedTicket.id, paymentData);
      if (paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      }
    } catch (error) {
      toast.error("Lỗi khi thanh toán. Vui lòng thử lại.");
      console.error("Payment error:", error);
    }
  };

  const handleCheckIn = () => {
    if (selectedTicket) {
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'PAID' as const } : t));
      setShowCheckInDialog(false);
      toast.success("Check-in thành công! Vui lòng đến cổng lên máy bay đúng giờ.");
      setSelectedTicket(null);
    }
  };

  const canCheckIn = (ticket: any): boolean => {
    if (ticket.status !== "PAID") return false;

    const flightDateTime = new Date(`${ticket.flight.date}T${ticket.flight.departureTime}`);
    const now = new Date();
    const hoursUntilFlight = (flightDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilFlight <= 24 && hoursUntilFlight > 0;
  };

  const getCheckInMessage = (ticket: any): string => {
    if (ticket.status !== "PAID") {
      return "Vui lòng thanh toán trước khi check-in";
    }

    const flightDateTime = new Date(`${ticket.flight.date}T${ticket.flight.departureTime}`);
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
    if (selectedTicket) {
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'CANCELED' as const } : t));
      setShowCancelDialog(false);
      toast.success("Vé đã được hủy");
      setSelectedTicket(null);
    }
  };

  const handleRefund = async () => {
    if (selectedTicket) {
      const refundAmount = selectedTicket.price * 0.8;
      setShowRefundDialog(false);

      const res = await ticketService.refund(selectedTicket.id);

      if (res.code === 200 || res.code === 0 || res.message?.toLowerCase().includes('success')) {
        toast.success(`Hoàn tiền ${formatCurrency(refundAmount)} thành công!`);
        setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'CANCELED' as const } : t));
        setSelectedTicket(null);
      } else {
        toast.error("Hoàn tiền thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <TicketIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
        <Badge variant="secondary">{tickets.length} vé</Badge>
      </div>

      {tickets.map((ticket) => {
        const flight = ticket.flight;

        return (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {flight.id}
                    {getStatusBadge(ticket.status)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Mã vé: {ticket.id}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{ticket.ticketClass}</p>
                  <p className="text-sm text-gray-600">
                    {ticket.ticketClass.toString() === "FIRST"
                      ? "Hạng Nhất"
                      : ticket.ticketClass === "BUSINESS"
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
                    <p className="font-semibold">{flight.route.origin} - {flight.route.destination}</p>
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
                    <p className="font-semibold">{flight.departureTime.toString().split('T')[1].substring(0, 5)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá vé</p>
                  <p className="font-semibold">{formatCurrency(ticket.price)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                {ticket.status === "RESERVED" && (
                  <>
                    <Button onClick={() => handlePayment(ticket)}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Thanh toán ngay
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowCancelDialog(true);
                      }}
                    >
                      Hủy vé
                    </Button>
                  </>
                )}

                {ticket.status === "PAID" && (
                  <>
                    {canCheckIn(ticket) ? (
                      <Button
                        onClick={() => {
                          setSelectedTicket(ticket);
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
                          {getCheckInMessage(ticket)}
                        </p>
                      </div>
                    )}
                    {/* <Button variant="outline">Đổi vé</Button>
                    <Button variant="outline">Nâng hạng</Button> */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowRefundDialog(true);
                      }}
                    >
                      Hoàn tiền
                    </Button>
                  </>
                )}

                {ticket.status === "CHANGED" && (
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
          {selectedTicket && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Giá vé gốc:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedTicket.price)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Số tiền hoàn lại (80%):</span>
                <span className="font-bold">
                  {formatCurrency(selectedTicket.price * 0.8)}
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
          {selectedTicket && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Giá vé:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedTicket.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="font-bold">
                  {getStatusBadge(selectedTicket.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thông báo:</span>
                <span className="text-sm text-right">
                  {getCheckInMessage(selectedTicket)}
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

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xác nhận thông tin thanh toán vé</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 pr-4">
              {/* Thông tin chuyến bay */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin chuyến bay</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã chuyến bay:</span>
                    <span className="font-semibold">{selectedTicket.flight.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuyến đường:</span>
                    <span className="font-semibold">
                      {selectedTicket.flight.route.origin} → {selectedTicket.flight.route.destination}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày bay:</span>
                    <span className="font-semibold">
                      {new Date(selectedTicket.flight.departureTime).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giờ khởi hành:</span>
                    <span className="font-semibold">
                      {selectedTicket.flight.departureTime.toString().split('T')[1].substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hạng vé:</span>
                    <span className="font-semibold">
                      {selectedTicket.ticketClass.toString() === "FIRST"
                        ? "Hạng Nhất"
                        : selectedTicket.ticketClass === "BUSINESS"
                          ? "Thương Gia"
                          : "Phổ Thông"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Thông tin thanh toán */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Giá vé:</span>
                      <span className="font-semibold">{formatCurrency(selectedTicket.price)}</span>
                    </div>

                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Tổng cộng:</span>
                      <span className="font-bold text-lg text-blue-600">
                        {formatCurrency(selectedTicket.price)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nút hành động */}
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleConfirmPayment} className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Xác nhận thanh toán
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}