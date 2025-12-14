import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, Plane, Clock, Calendar, Users, UserPlus } from "lucide-react";
import { mockFlights, formatCurrency } from "../../lib/mockData";
import { SeatSelection } from "./SeatSelection";
import SeatClassSelection from "./SeatClassSelection";
import { toast } from "sonner@2.0.3";
import type { Flight, WaitingListEntry } from "../../lib/mockData";

interface FlightSearchProps {
  userId: string;
}

export function FlightSearch({ userId }: FlightSearchProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    let results = mockFlights;

    if (origin) {
      const q = origin.toLowerCase();
      results = results.filter(
        (f) =>
          f.departure.toLowerCase().includes(q) ||
          f.route.toLowerCase().includes(q)
      );
    }

    if (destination) {
      const q = destination.toLowerCase();
      results = results.filter(
        (f) =>
          f.arrival.toLowerCase().includes(q) ||
          f.route.toLowerCase().includes(q)
      );
    }

    if (searchDate) {
      results = results.filter((f) => f.date === searchDate);
    }

    setSearchResults(results);
    setHasSearched(true);
  };

  const handleJoinWaitingList = (flight: Flight) => {
    // Initialize waiting list if it doesn't exist
    if (!flight.waitingList) {
      flight.waitingList = [];
    }

    // Check if user is already in the waiting list
    const alreadyInList = flight.waitingList.some(
      (entry) => entry.passengerId === userId
    );

    if (alreadyInList) {
      toast.error("Bạn đã đăng ký chờ cho chuyến bay này!");
      return;
    }

    // Add to waiting list
    const newEntry: WaitingListEntry = {
      id: "wl" + Date.now(),
      passengerId: userId,
      passengerName: "Hành khách", // In real app, get from user data
      passengerEmail: "passenger@example.com", // In real app, get from user data
      registeredAt: new Date().toISOString(),
      notified: false,
    };

    flight.waitingList.push(newEntry);
    
    // Update search results to reflect the change
    setSearchResults([...searchResults]);
    
    toast.success("Đã đăng ký chờ thành công! Chúng tôi sẽ thông báo khi có chỗ trống.");
  };

  const isInWaitingList = (flight: Flight) => {
    return flight.waitingList?.some((entry) => entry.passengerId === userId) || false;
  };

  const getStatusBadge = (status: Flight["status"]) => {
    const variants: Record<Flight["status"], { variant: any; label: string }> = {
      open: { variant: "default", label: "Còn chỗ" },
      full: { variant: "secondary", label: "Hết chỗ" },
      delayed: { variant: "destructive", label: "Chậm" },
      canceled: { variant: "destructive", label: "Hủy" },
      completed: { variant: "secondary", label: "Hoàn thành" },
    };

    return (
      <Badge variant={variants[status].variant as any}>
        {variants[status].label}
      </Badge>
    );
  };

  if (selectedFlight) {
    return (
      <SeatClassSelection
        flight={selectedFlight}
        userId={userId}
        onBack={() => setSelectedFlight(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm chuyến bay</CardTitle>
          <CardDescription>
            Tìm theo mã chuyến bay, tuyến đường hoặc ngày bay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Nơi đi</Label>
              <Input
                id="origin"
                placeholder="Hà Nội, SGN, Nội Bài..."
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Nơi đến</Label>
              <Input
                id="destination"
                placeholder="TP.HCM, DAD, Tân Sơn Nhất..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Ngày bay</Label>
              <Input
                id="date"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSearch} className="w-full md:w-auto mt-4">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Kết quả tìm kiếm</h3>
            <p className="text-sm text-gray-600">
              Tìm thấy {searchResults.length} chuyến bay
            </p>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Không tìm thấy chuyến bay phù hợp
              </CardContent>
            </Card>
          ) : (
            searchResults.map((flight) => (
              <Card key={flight.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3>{flight.flightCode}</h3>
                        {getStatusBadge(flight.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{flight.route}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(flight.date).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {flight.departureTime} - {flight.arrivalTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Plane className="w-4 h-4" />
                          {flight.aircraftType}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <span className="text-sm text-gray-600">Phổ thông:</span>
                          <span className="font-semibold">
                            {formatCurrency(flight.prices.economy)}
                          </span>
                        </div>
                        {flight.prices.business > 0 && (
                          <div className="flex items-center justify-between md:justify-end gap-4">
                            <span className="text-sm text-gray-600">Thương gia:</span>
                            <span className="font-semibold">
                              {formatCurrency(flight.prices.business)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {flight.availableSeats.economy +
                            flight.availableSeats.business +
                            flight.availableSeats.first}{" "}
                          chỗ trống
                        </span>
                      </div>

                      {flight.status === "full" && flight.waitingList && flight.waitingList.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <UserPlus className="w-4 h-4" />
                          <span>{flight.waitingList.length} người đăng ký chờ</span>
                        </div>
                      )}

                      {flight.status === "open" ? (
                        <Button onClick={() => setSelectedFlight(flight)}>
                          Chọn chuyến bay
                        </Button>
                      ) : flight.status === "full" ? (
                        <div className="flex gap-2">
                          <Button variant="outline" disabled>
                            Hết chỗ
                          </Button>
                          {!isInWaitingList(flight) ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleJoinWaitingList(flight)}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Đăng ký chờ
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="px-3 py-2">
                              Đã đăng ký chờ
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Button variant="outline" disabled>
                          Không khả dụng
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}