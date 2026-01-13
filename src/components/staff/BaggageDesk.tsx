import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Search, Luggage, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import { ticketService } from "../../services/ticketService";
import { baggageService } from "../../services/baggageService";
import type { Ticket } from "../../types/ticketType";
import type { BaggageType } from "../../types/baggageType";

export function BaggageDesk() {
  const [ticketCode, setTicketCode] = useState("");
  const [booking, setBooking] = useState<Ticket | null>(null);
  const [baggageType, setBaggageType] = useState<BaggageType>("CARRY_ON");
  const [weight, setWeight] = useState(0);
  const [fee, setFee] = useState(0);
  const [registered, setRegistered] = useState(false);

  const handleSearch = async () => {
    try {
      const foundBooking = await ticketService.getTicketById(parseInt(ticketCode));

      if (!foundBooking) {
        toast.error("Không tìm thấy vé");
        return;
      }

      if (foundBooking.status === "CANCELED") {
        toast.error("Vé đã bị hủy");
        return;
      }

      if (foundBooking.status !== "PAID") {
        toast.error("Vé chưa được thanh toán");
        return;
      }

      setBooking(foundBooking);
      setBaggageType("CARRY_ON");
      setWeight(0);
      setFee(0);
      setRegistered(false);

      toast.success("Tìm thấy vé!");
    } catch (error) {
      toast.error("Lỗi khi tìm vé");
    }
  };

  const calculateFee = async () => {
    if (!booking) return;

    if (weight === 0) {
      setFee(0);
      return;
    }

    try {
      const response = await baggageService.calculateFee({
        type: baggageType,
        weight,
        passengerId: booking.passenger.id!,
        flightId: booking.flight.id,
      });
      setFee(response.data.fee);
    } catch (error) {
      toast.error("Lỗi khi tính phí");
    }
  };

  const handleRegister = async () => {
    if (!booking) return;

    try {
      await baggageService.createNewBaggage({
        type: baggageType,
        weight,
        passengerId: booking.passenger.id!,
        flightId: booking.flight.id,
      });

      setRegistered(true);
      toast.success("Hành lý đã đăng ký thành công!");
    } catch (error) {
      toast.error("Lỗi khi đăng ký hành lý");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quầy Hành Lý</CardTitle>
          <CardDescription>Đăng ký hành lý ký gửi cho hành khách</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="ticketCode" className="sr-only">
                Mã vé
              </Label>
              <Input
                id="ticketCode"
                placeholder="TK001234567"
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

      {booking && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin vé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã vé</p>
                  <p className="font-semibold">{(booking as any).ticketCode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạng vé</p>
                  <p className="font-semibold">
                    {booking.ticketClass === "FIRST_CLASS"
                      ? "Hạng Nhất"
                      : booking.ticketClass === "BUSINESS"
                        ? "Thương Gia"
                        : "Phổ Thông"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="font-semibold">
                    {booking.status === "PAID" ? "Đã thanh toán" : booking.status === "CANCELED" ? "Đã hủy" : "Chưa thanh toán"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tên hành khách</p>
                  <p className="font-semibold">{booking.passenger.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã chuyến bay</p>
                  <p className="font-semibold">{(booking.flight as any).flightCode || `FL${booking.flight.id}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tuyến</p>
                  <p className="font-semibold">{booking.flight.route.origin} - {booking.flight.route.destination}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đăng ký hành lý</CardTitle>
              <CardDescription>
                Chọn loại hành lý và nhập trọng lượng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baggageType">Loại hành lý</Label>

                  <select
                    id="baggageType"
                    className="border rounded px-3 py-2 w-full"
                    value={baggageType}
                    onChange={(e) => setBaggageType(e.target.value as BaggageType)}
                    disabled={registered}
                  >
                    <option value="CARRY_ON">Xách tay</option>
                    <option value="CHECKED">Ký gửi</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Trọng lượng (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    max="50"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    disabled={registered}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={calculateFee}
                  disabled={!booking}
                >
                  Tính phí
                </Button>
              </div>

              <Separator />

              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <h3 className="font-semibold">Tổng phí hành lý</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {fee > 0 ? formatCurrency(fee) : "0đ"}
                    </span>
                  </div>
                </div>
              </div>

              {!registered ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRegister}
                  disabled={weight === 0}
                >
                  <Luggage className="w-4 h-4 mr-2" />
                  Xác nhận
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                    <p className="font-semibold text-green-800">
                      ✓ Hành lý đã được đăng ký thành công
                    </p>
                    {fee > 0 && (
                      <p className="text-sm text-green-700 mt-1">
                        Vui lòng thu phí: {formatCurrency(fee)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setRegistered(false);
                      setBooking(null);
                      setTicketCode("");
                      setBaggageType("CARRY_ON");
                      setWeight(0);
                      setFee(0);
                    }}
                  >
                    Hoàn tất
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!booking && (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <Luggage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Nhập mã vé để đăng ký hành lý</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
