import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Calendar, Clock, Plane, Ticket, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import type { Ticket } from "../../types/ticketType";
import { ticketService } from "../../services/ticketService";

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
    toast.success("Chuyển đến trang thanh toán...");
    // For now, mock update
    setTimeout(() => {
      // Update local state
      setTickets(tickets.map(t => t.id === ticket.id ? { ...t, status: 'PAID' as const } : t));
      toast.success("Thanh toán thành công!");
    }, 1500);
  };

  const handleCheckIn = () => {
    if (selectedTicket) {
      // Mock check-in
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'PAID' as const } : t)); // Keep as PAID
      setShowCheckInDialog(false);
      toast.success("Check-in thành công! Vui lòng đến cổng lên máy bay đúng giờ.");
      setSelectedTicket(null);
    }
  };

  const canCheckIn = (ticket: any): boolean => {
    // Can only check-in if status is "PAID"
    if (ticket.status !== "PAID") return false;

    // Check if flight date is within 24 hours
    const flightDateTime = new Date(`${ticket.flight.date}T${ticket.flight.departureTime}`);
    const now = new Date();
    const hoursUntilFlight = (flightDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can check-in 24 hours before and up to departure time
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

  const handleRefund = () => {
    if (selectedTicket) {
      const refundAmount = selectedTicket.price * 0.8; // 80% refund

      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'CANCELED' as const } : t));
      setShowRefundDialog(false);

      toast.success(`Hoàn tiền ${formatCurrency(refundAmount)} thành công!`);
      setSelectedTicket(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (tickets.length === 0) {
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
                    {flight.flightCode}
                    {getStatusBadge(ticket.status)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Mã vé: {ticket.id}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{/*ticket.seat.seatNumber*/ticket.ticketClass}</p>
                  <p className="text-sm text-gray-600">
                    {ticket.ticketClass === "FIRST"
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
                  <p className="font-semibold">{formatCurrency(ticket.price)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                {ticket.status === "RESERVED" && (
                  <>
                    <Button onClick={() => handlePayment(ticket)}>
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
                    <Button variant="outline">Đổi vé</Button>
                    <Button variant="outline">Nâng hạng</Button>
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Giá vé gốc:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedTicket.price)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Trạng thái:</span>
                <span className="font-bold">
                  {getStatusBadge(selectedTicket.status)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Thông báo:</span>
                <span className="font-bold">
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
    </div>
  );
}