import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Search, Luggage, AlertTriangle } from "lucide-react";
import { mockBookings, mockFlights, formatCurrency, calculateBaggageFee } from "../../lib/mockData";
import { toast } from "sonner";
import type { Booking, Flight } from "../../lib/mockData";

export function BaggageDesk() {
  const [ticketCode, setTicketCode] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [carryOnWeight, setCarryOnWeight] = useState(0);
  const [checkedWeight, setCheckedWeight] = useState(0);
  const [registered, setRegistered] = useState(false);

  const handleSearch = () => {
    const foundBooking = mockBookings.find((b) => b.ticketCode === ticketCode);

    if (!foundBooking) {
      toast.error("Không tìm thấy vé");
      return;
    }

    if (foundBooking.status === "canceled") {
      toast.error("Vé đã bị hủy");
      return;
    }

    if (foundBooking.status !== "paid" && foundBooking.status !== "checked-in") {
      toast.error("Vé chưa được thanh toán");
      return;
    }

    const foundFlight = mockFlights.find((f) => f.id === foundBooking.flightId);

    if (!foundFlight) {
      toast.error("Không tìm thấy thông tin chuyến bay");
      return;
    }

    setBooking(foundBooking);
    setFlight(foundFlight);
    setRegistered(false);

    // Load existing baggage if available
    if (foundBooking.baggage) {
      setCarryOnWeight(foundBooking.baggage.carryOn);
      setCheckedWeight(foundBooking.baggage.checked);
    } else {
      setCarryOnWeight(0);
      setCheckedWeight(0);
    }

    toast.success("Tìm thấy vé!");
  };

  const handleRegister = () => {
    if (!booking) return;

    const fee = calculateBaggageFee(booking.seatClass, carryOnWeight, checkedWeight);

    booking.baggage = {
      carryOn: carryOnWeight,
      checked: checkedWeight,
      extraFee: fee,
    };

    setBooking({ ...booking });
    setRegistered(true);

    if (fee > 0) {
      toast.success(`Hành lý đã đăng ký. Phí vượt mức: ${formatCurrency(fee)}`);
    } else {
      toast.success("Hành lý đã đăng ký thành công!");
    }
  };

  const limits = {
    carryOn: 7,
    checked: {
      economy: 20,
      business: 30,
      first: 40,
    },
  };

  const allowedChecked = booking ? limits.checked[booking.seatClass] : 20;
  const carryOnExcess = Math.max(0, carryOnWeight - limits.carryOn);
  const checkedExcess = Math.max(0, checkedWeight - allowedChecked);
  const totalExcess = carryOnExcess + checkedExcess;
  const extraFee = booking ? calculateBaggageFee(booking.seatClass, carryOnWeight, checkedWeight) : 0;

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

      {booking && flight && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hành khách</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-semibold">{booking.passengerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chuyến bay</p>
                  <p className="font-semibold">{flight.flightCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạng vé</p>
                  <p className="font-semibold">
                    {booking.seatClass === "first"
                      ? "Hạng Nhất"
                      : booking.seatClass === "business"
                      ? "Thương Gia"
                      : "Phổ Thông"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đăng ký hành lý</CardTitle>
              <CardDescription>
                Nhập trọng lượng hành lý và hệ thống sẽ tự động tính phí vượt mức
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carryOn">
                    Hành lý xách tay (kg)
                    <span className="text-gray-500 ml-2">Cho phép: 7 kg</span>
                  </Label>
                  <Input
                    id="carryOn"
                    type="number"
                    min="0"
                    max="50"
                    value={carryOnWeight}
                    onChange={(e) => setCarryOnWeight(Number(e.target.value))}
                    disabled={registered}
                  />
                  {carryOnExcess > 0 && (
                    <p className="text-sm text-red-600">Vượt quá: {carryOnExcess} kg</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checked">
                    Hành lý ký gửi (kg)
                    <span className="text-gray-500 ml-2">Cho phép: {allowedChecked} kg</span>
                  </Label>
                  <Input
                    id="checked"
                    type="number"
                    min="0"
                    max="100"
                    value={checkedWeight}
                    onChange={(e) => setCheckedWeight(Number(e.target.value))}
                    disabled={registered}
                  />
                  {checkedExcess > 0 && (
                    <p className="text-sm text-red-600">Vượt quá: {checkedExcess} kg</p>
                  )}
                </div>
              </div>

              {totalExcess > 0 && !registered && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-800">Cảnh báo hành lý vượt mức</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Tổng hành lý vượt quá {totalExcess} kg. Phí vượt mức sẽ được áp dụng.
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <h3 className="font-semibold">Chi tiết tính phí</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng trọng lượng vượt mức:</span>
                    <span className="font-semibold">{totalExcess} kg</span>
                  </div>

                  {totalExcess > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Làm tròn lên (5 kg):</span>
                        <span className="font-semibold">
                          {Math.ceil(totalExcess / 5) * 5} kg
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Đơn giá:</span>
                        <span className="font-semibold">100,000đ / 5 kg</span>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-bold">Phí hành lý vượt mức:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {extraFee > 0 ? formatCurrency(extraFee) : "0đ"}
                    </span>
                  </div>
                </div>

                {extraFee === 0 && totalExcess === 0 && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center mt-4">
                    <p className="text-sm text-green-800">
                      ✓ Hành lý nằm trong giới hạn cho phép
                    </p>
                  </div>
                )}
              </div>

              {!registered ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRegister}
                  disabled={carryOnWeight === 0 && checkedWeight === 0}
                >
                  <Luggage className="w-4 h-4 mr-2" />
                  Đăng ký hành lý
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                    <p className="font-semibold text-green-800">
                      ✓ Hành lý đã được đăng ký thành công
                    </p>
                    {extraFee > 0 && (
                      <p className="text-sm text-green-700 mt-1">
                        Vui lòng thu phí vượt mức: {formatCurrency(extraFee)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setRegistered(false);
                      setBooking(null);
                      setFlight(null);
                      setTicketCode("");
                      setCarryOnWeight(0);
                      setCheckedWeight(0);
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
