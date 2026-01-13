import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Search, User, Plane, Calendar, Luggage, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import { baggageService } from "../../services/baggageService";
import type { Baggage } from "../../types/baggageType";
import type { Flight } from "../../types/flightType";
import type { Passenger } from "../../types/passengerType";
import passengerService from "../../services/passengerService";

export function PassengerVerification() {
  const [passenger, setPassenger] = useState<Passenger>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flight, setFlight] = useState<Flight | null>(null);
  const [baggage, setBaggage] = useState<Baggage[]>([]);

  const handleSearch = async () => {
    if (!/^\d+$/.test(searchQuery)) {
      toast.error("Vui lòng nhập mã vé (số)");
      return;
    }

    try {
      const res = await baggageService.getBaggageByPassenger(parseInt(searchQuery));
      if (res) {
        setFlight(res.data.content[0].flight);
        setPassenger(res.data.content[0].passenger);
        setBaggage(res.data.content);
        toast.success("Tìm thấy thông tin!");
      }

    } catch (error) {
      console.error("Error:", error);
      toast.error("Không tìm thấy thông tin");
      setFlight(null);
      setBaggage([]);
    }
  };

  const carryOnWeight = baggage.filter(b => b.type === "CARRY_ON").reduce((sum, b) => sum + b.weight, 0);
  const checkedWeight = baggage.filter(b => b.type === "CHECKED").reduce((sum, b) => sum + b.weight, 0);
  const totalExtraFee = baggage.reduce((sum, b) => sum + b.extraFee, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xác minh hành khách</CardTitle>
          <CardDescription>
            Tìm kiếm theo mã vé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Tìm kiếm
              </Label>
              <Input
                id="search"
                placeholder="Nhập mã vé (số)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {flight && (
        <>
          {/* Passenger Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin hành khách
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-semibold">{passenger.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-mono font-semibold">{passenger.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flight Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Thông tin chuyến bay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã chuyến bay</p>
                  <p className="font-semibold">{flight.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tuyến đường</p>
                  <p className="font-semibold">{flight.route.origin} - {flight.route.destination}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày bay</p>
                    <p className="font-semibold">
                      {new Date(flight.arrivalTime).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ khởi hành</p>
                  <p className="font-semibold">{flight.departureTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Máy bay</p>
                  <p className="font-semibold">{flight.aircraft.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái chuyến bay</p>
                  <Badge>
                    {flight.status === "OPEN"
                      ? "Bình thường"
                      : flight.status === "DELAYED"
                        ? "Hoãn"
                        : flight.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat & Baggage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Luggage className="w-5 h-5" />
                Hành lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {baggage.length > 0 && (
                <>
                  <Separator />
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Hành lý xách tay</p>
                      <p className="font-semibold">{carryOnWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hành lý ký gửi</p>
                      <p className="font-semibold">{checkedWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phí vượt mức</p>
                      <p className="font-semibold">
                        {formatCurrency(totalExtraFee)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}