import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Download, FileText, TrendingUp, Users, Plane, DollarSign } from "lucide-react";
import { mockFlights, mockBookings, mockAircraft, mockCrew, formatCurrency } from "../../lib/mockData";
import { toast } from "sonner@2.0.3";

export function Reports() {
  const handleDownloadReport = (reportName: string) => {
    toast.success(`Đang tải báo cáo ${reportName}...`);
  };

  // Calculate statistics
  const totalRevenue = mockBookings
    .filter((b) => b.status === "paid" || b.status === "checked-in")
    .reduce((sum, b) => sum + b.price, 0);

  const totalBookings = mockBookings.length;
  const paidBookings = mockBookings.filter((b) => b.status === "paid" || b.status === "checked-in").length;
  const canceledBookings = mockBookings.filter((b) => b.status === "canceled").length;

  const economyBookings = mockBookings.filter((b) => b.seatClass === "economy").length;
  const businessBookings = mockBookings.filter((b) => b.seatClass === "business").length;
  const firstBookings = mockBookings.filter((b) => b.seatClass === "first").length;

  const activeFlights = mockFlights.filter((f) => f.status === "open" || f.status === "full").length;
  const delayedFlights = mockFlights.filter((f) => f.status === "delayed").length;
  const canceledFlights = mockFlights.filter((f) => f.status === "canceled").length;

  const activeAircraft = mockAircraft.filter((a) => a.status === "active").length;
  const maintenanceAircraft = mockAircraft.filter((a) => a.status === "maintenance").length;

  const pilots = mockCrew.filter((c) => c.role === "pilot").length;
  const attendants = mockCrew.filter((c) => c.role === "attendant").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Báo cáo & Phân tích</h2>
          <p className="text-sm text-gray-600 mt-1">
            Xem và tải xuống các báo cáo hệ thống
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="operations">Điều hành</TabsTrigger>
          <TabsTrigger value="resources">Nguồn lực</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Tổng doanh thu
                </CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(totalRevenue)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Tổng số vé
                </CardDescription>
                <CardTitle className="text-2xl">{totalBookings}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <Plane className="w-4 h-4" />
                  Chuyến bay
                </CardDescription>
                <CardTitle className="text-2xl">{mockFlights.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Phi hành đoàn
                </CardDescription>
                <CardTitle className="text-2xl">{mockCrew.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê vé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Đã thanh toán</p>
                    <p className="text-2xl font-bold text-green-600">{paidBookings}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Đang giữ chỗ</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {mockBookings.filter((b) => b.status === "reserved").length}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Đã check-in</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {mockBookings.filter((b) => b.status === "checked-in").length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
                    <p className="text-2xl font-bold text-red-600">{canceledBookings}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân bổ hạng vé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Phổ thông</p>
                  <p className="text-3xl font-bold">{economyBookings}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {((economyBookings / totalBookings) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Thương gia</p>
                  <p className="text-3xl font-bold">{businessBookings}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {((businessBookings / totalBookings) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Hạng nhất</p>
                  <p className="text-3xl font-bold">{firstBookings}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {((firstBookings / totalBookings) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Báo cáo doanh thu
              </CardTitle>
              <CardDescription>
                Thống kê doanh thu theo chuyến bay, hạng vé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Doanh thu trung bình/vé</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(totalRevenue / paidBookings)}
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Tỷ lệ thanh toán</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {((paidBookings / totalBookings) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <Button onClick={() => handleDownloadReport("Doanh thu")}>
                <Download className="w-4 h-4 mr-2" />
                Tải báo cáo doanh thu (Excel)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo hạng vé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">Phổ thông</p>
                    <p className="text-sm text-gray-600">{economyBookings} vé</p>
                  </div>
                  <p className="font-bold">
                    {formatCurrency(
                      mockBookings
                        .filter((b) => b.seatClass === "economy" && (b.status === "paid" || b.status === "checked-in"))
                        .reduce((sum, b) => sum + b.price, 0)
                    )}
                  </p>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">Thương gia</p>
                    <p className="text-sm text-gray-600">{businessBookings} vé</p>
                  </div>
                  <p className="font-bold">
                    {formatCurrency(
                      mockBookings
                        .filter((b) => b.seatClass === "business" && (b.status === "paid" || b.status === "checked-in"))
                        .reduce((sum, b) => sum + b.price, 0)
                    )}
                  </p>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">Hạng nhất</p>
                    <p className="text-sm text-gray-600">{firstBookings} vé</p>
                  </div>
                  <p className="font-bold">
                    {formatCurrency(
                      mockBookings
                        .filter((b) => b.seatClass === "first" && (b.status === "paid" || b.status === "checked-in"))
                        .reduce((sum, b) => sum + b.price, 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo điều hành</CardTitle>
              <CardDescription>
                Thống kê tình trạng chuyến bay và hoạt động
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Chuyến bay hoạt động</p>
                  <p className="text-3xl font-bold text-green-600">{activeFlights}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Chuyến bay chậm</p>
                  <p className="text-3xl font-bold text-yellow-600">{delayedFlights}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Chuyến bay hủy</p>
                  <p className="text-3xl font-bold text-red-600">{canceledFlights}</p>
                </div>
              </div>

              <Button onClick={() => handleDownloadReport("Điều hành")}>
                <Download className="w-4 h-4 mr-2" />
                Tải báo cáo điều hành (PDF)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tỷ lệ lấp đầy chỗ ngồi (Load Factor)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFlights.map((flight) => {
                  const totalSeats =
                    flight.availableSeats.economy +
                    flight.availableSeats.business +
                    flight.availableSeats.first +
                    100; // Approximate occupied seats
                  const occupiedSeats = 100;
                  const loadFactor = (occupiedSeats / totalSeats) * 100;

                  return (
                    <div key={flight.id} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">{flight.flightCode}</p>
                        <p className="font-bold">{loadFactor.toFixed(1)}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${loadFactor}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo nguồn lực</CardTitle>
              <CardDescription>
                Thống kê máy bay, phi hành đoàn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3">Máy bay</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Hoạt động</p>
                    <p className="text-3xl font-bold text-green-600">{activeAircraft}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Bảo trì</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {maintenanceAircraft}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng số</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {mockAircraft.length}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">Phi hành đoàn</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Phi công</p>
                    <p className="text-3xl font-bold text-blue-600">{pilots}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Tiếp viên</p>
                    <p className="text-3xl font-bold text-purple-600">{attendants}</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleDownloadReport("Nguồn lực")}>
                <Download className="w-4 h-4 mr-2" />
                Tải báo cáo nguồn lực (Excel)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
