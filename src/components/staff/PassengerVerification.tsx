import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Search, User, Plane, Calendar, Luggage, Weight, Tag, AlertCircle } from "lucide-react"; // Thêm icon Weight, Tag cho đẹp
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import { baggageService } from "../../services/baggageService";
import type { Baggage } from "../../types/baggageType";
import type { Flight } from "../../types/flightType";
import type { Passenger } from "../../types/passengerType";

export function PassengerVerification() {
  const [passenger, setPassenger] = useState<Passenger | null>(null);
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
      // Giả sử res.data.content là mảng chứa thông tin baggage
      if (res && res.data && res.data.content.length > 0) {
        // Lấy thông tin flight/passenger từ phần tử đầu tiên (giả định cấu trúc dữ liệu trả về như cũ)
        setFlight(res.data.content[0].flight);
        setPassenger(res.data.content[0].passenger);
        setBaggage(res.data.content);
        toast.success("Tìm thấy thông tin!");
      } else {
        toast.error("Không tìm thấy dữ liệu hành lý");
      }

    } catch (error) {
      console.error("Error:", error);
      toast.error("Không tìm thấy thông tin hoặc lỗi hệ thống");
      setFlight(null);
      setBaggage([]);
      setPassenger(null);
    }
  };

  const carryOnWeight = baggage.filter(b => b.type === "CARRY_ON").reduce((sum, b) => sum + b.weight, 0);
  const checkedWeight = baggage.filter(b => b.type === "CHECKED").reduce((sum, b) => sum + b.weight, 0);
  const totalExtraFee = baggage.reduce((sum, b) => sum + b.extraFee, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Section - Giữ nguyên */}
      <Card>
        <CardHeader>
          <CardTitle>Xác minh hành khách</CardTitle>
          <CardDescription>Tìm kiếm theo mã vé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Tìm kiếm</Label>
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

      {flight && passenger && (
        <>
          {/* Passenger Info - Giữ nguyên */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Thông tin hành khách
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

          {/* Flight Info - Giữ nguyên */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" /> Thông tin chuyến bay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ... (Code hiển thị Flight giữ nguyên như cũ của bạn) ... */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã chuyến bay</p>
                  <p className="font-semibold">{flight.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tuyến đường</p>
                  <p className="font-semibold">{flight.route.origin} - {flight.route.destination}</p>
                </div>
                {/* ... Các trường khác giữ nguyên ... */}
              </div>
            </CardContent>
          </Card>

          {/* Seat & Baggage Info - PHẦN ĐÃ CHỈNH SỬA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Luggage className="w-5 h-5" />
                Hành lý & Phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Phần tổng quan (Summary) */}
              {baggage.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Tổng TL xách tay</p>
                      <p className="font-bold text-lg">{carryOnWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng TL ký gửi</p>
                      <p className="font-bold text-lg">{checkedWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng phí thêm</p>
                      <p className="font-bold text-lg text-red-600">
                        {formatCurrency(totalExtraFee)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Phần chi tiết danh sách (List Detail) */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Chi tiết từng kiện
                    </h4>
                    <div className="grid gap-3">
                      {baggage.map((item, index) => (
                        <div
                          key={index} // Tốt nhất nên dùng item.id nếu có, thay vì index
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${item.type === 'CARRY_ON' ? 'bg-white text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                              <Luggage className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {item.type === "CARRY_ON" ? "Hành lý xách tay" : "Hành lý ký gửi"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Mã kiện: {item.id || `#${index + 1}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-2 sm:mt-0 ml-11 sm:ml-0">
                            <div className="flex items-center gap-2">
                              <Weight className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold">{item.weight} kg</span>
                            </div>

                            {item.extraFee > 0 ? (
                              <Badge variant="destructive">
                                + {formatCurrency(item.extraFee)}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-green-600 bg-green-50 hover:bg-green-100">
                                Miễn phí
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Hành khách này không có hành lý ghi nhận.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}