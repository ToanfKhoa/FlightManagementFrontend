import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, Plane, Clock, Calendar, Users, UserPlus } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import SeatClassSelection from "./SeatClassSelection";
import type { Flight, FlightsPageResponse, Route } from "../../types/flightType";
import type { WaitingListEntry } from "../../lib/mockData";
import { flightService } from "../../services/flightService";
import { routeService } from "../../services/routeService";
import ApiResponse from "../../types/commonType";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface FlightSearchProps {
  userId: string;
}

export function FlightSearch({ userId }: FlightSearchProps) {
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [searchDate, setSearchDate] = useState("");
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // useEffect(() => {
  //   if (debouncedOrigin || debouncedDestination || debouncedDate) {
  //     handleSearch();
  //   }
  // }, [debouncedOrigin, debouncedDestination, debouncedDate]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routes: Route[] = await routeService.getAll();
        const uniqueOrigins = [...new Set(routes.map(r => r.origin))];
        const uniqueDestinations = [...new Set(routes.map(r => r.destination))];
        setOrigins(uniqueOrigins);
        setDestinations(uniqueDestinations);
      } catch (error) {
        toast.error("Lỗi khi tải danh sách địa điểm");
      }
    };
    fetchRoutes();
  }, []);

  const handleSearch = async () => {
    if (!origin.trim() || !destination.trim() || !searchDate.trim()) {
      toast.error("Vui lòng điền đầy đủ nơi đi, nơi đến và ngày bay");
      return;
    }

    setIsSearching(true);
    try {
      const res = await flightService.getAll({
        origin: origin,
        destination: destination,
        date: searchDate ? `${searchDate}T00:00:00Z` : ""
      });

      const response = res.data.content as Flight[]//ApiResponse<FlightsPageResponse>;
      if (response) {//?.data) {
        //const results = response as ApiResponse<FlightsPageResponse>
        setSearchResults(response/*results.data.content*/ as Flight[]);
        setHasSearched(true);
      }

    } catch (error) {
      toast.error("Lỗi khi tìm kiếm chuyến bay");
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // const handleJoinWaitingList = (flight: Flight) => {
  //   // Initialize waiting list if it doesn't exist
  //   if (!flight.waitingList) {
  //     flight.waitingList = [];
  //   }

  //   // Check if user is already in the waiting list
  //   const alreadyInList = flight.waitingList.some(
  //     (entry) => entry.passengerId === userId
  //   );

  //   if (alreadyInList) {
  //     toast.error("Bạn đã đăng ký chờ cho chuyến bay này!");
  //     return;
  //   }

  //   // Add to waiting list
  //   const newEntry: WaitingListEntry = {
  //     id: "wl" + Date.now(),
  //     passengerId: userId,
  //     passengerName: "Hành khách", // In real app, get from user data
  //     passengerEmail: "passenger@example.com", // In real app, get from user data
  //     registeredAt: new Date().toISOString(),
  //     notified: false,
  //   };

  //   flight.waitingList.push(newEntry);

  //   // Update search results to reflect the change
  //   setSearchResults([...searchResults]);

  //   toast.success("Đã đăng ký chờ thành công! Chúng tôi sẽ thông báo khi có chỗ trống.");
  // };

  // const isInWaitingList = (flight: Flight) => {
  //   return flight.waitingList?.some((entry) => entry.passengerId === userId) || false;
  // };

  const getStatusBadge = (status: Flight["status"]) => {
    const variants: Record<Flight["status"], { variant: any; label: string }> = {
      OPEN: { variant: "default", label: "Còn chỗ" },
      FULL: { variant: "secondary", label: "Hết chỗ" },
      DELAYED: { variant: "destructive", label: "Chậm" },
      CANCELED: { variant: "destructive", label: "Hủy" },
      COMPLETED: { variant: "secondary", label: "Hoàn thành" },
      DEPARTED: { variant: "secondary", label: "Khởi hành" },
    };

    const key = String(status ?? '').toUpperCase();
    const v = variants[key as Flight["status"]] ?? { variant: "default", label: key };
    return <Badge variant={v.variant}>{v.label}</Badge>;
  };

  if (selectedFlight) {
    return (
      <SeatClassSelection
        flight={selectedFlight as any}
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
              <select
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Chọn nơi đi</option>
                {origins.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Nơi đến</Label>
              <select
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Chọn nơi đến</option>
                {destinations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Ngày bay</Label>
              <Input
                id="date"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch} className="w-full md:w-auto mt-4" disabled={isSearching}>
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
          </div>

        </CardContent>
      </Card>

      {isSearching && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Đang tìm chuyến bay...</p>
        </div>
      )}

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
                        <h3>{flight.id}</h3>
                        {getStatusBadge(flight.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{flight.route.origin} → {flight.route.destination}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {/* <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {flight.date ? new Date(flight.date).toLocaleDateString("vi-VN") : '—'}
                        </div> */}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {flight.schedule ? new Date(flight.schedule.departureTime).toLocaleDateString("vi-VN") : '-'} - {flight.schedule ? new Date(flight.schedule.arrivalTime).toLocaleDateString("vi-VN") : '-'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Plane className="w-4 h-4" />
                          {flight.aircraft.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      {/* <div className="space-y-1">
                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <span className="text-sm text-gray-600">Phổ thông:</span>
                          <span className="font-semibold">
                            {flight.seat ? formatCurrency(flight.prices.economy) : '—'}
                          </span>
                        </div>
                        {flight.prices && flight.prices.business > 0 && (
                          <div className="flex items-center justify-between md:justify-end gap-4">
                            <span className="text-sm text-gray-600">Thương gia:</span>
                            <span className="font-semibold">
                              {formatCurrency(flight.prices.business)}
                            </span>
                          </div>
                        )}
                      </div> */}

                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {flight.availableSeats ? flight.availableSeats.economy +
                            flight.availableSeats.business +
                            flight.availableSeats.first : 0}{" "}
                          chỗ trống
                        </span>
                      </div>

                      {/* {flight.status === "FULL" && flight.waitingList && flight.waitingList.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <UserPlus className="w-4 h-4" />
                          <span>{flight.waitingList.length} người đăng ký chờ</span>
                        </div>
                      )} */}

                      {flight.status === "OPEN" ? (
                        <Button onClick={() => setSelectedFlight(flight)}>
                          Chọn chuyến bay
                        </Button>
                      ) : flight.status === "FULL" ? (
                        <div className="flex gap-2">
                          <Button variant="outline" disabled>
                            Hết chỗ
                          </Button>
                          {/* {!isInWaitingList(flight) ? (
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
                          )} */}
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