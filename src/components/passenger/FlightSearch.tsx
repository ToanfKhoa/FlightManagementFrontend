import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, Plane, Clock, Calendar, Users, AlertCircle, X } from "lucide-react";
import { formatCurrency } from "../../lib/mockData";
import { toast } from "sonner";
import SeatClassSelection from "./SeatClassSelection";
import type { Flight, FlightsPageResponse, Route } from "../../types/flightType";
import type { WaitingListEntry } from "../../lib/mockData";
import { flightService } from "../../services/flightService";
import { routeService } from "../../services/routeService";
import ApiResponse from "../../types/commonType";

interface FlightSearchProps {
  userId: number;
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

      const response = res.data.content as Flight[];
      if (response) {
        setSearchResults(response as Flight[]);
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

  const formatTimeDisplay = (dateTimeString: string): string => {
    if (!dateTimeString) return "—";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
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
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm chuyến bay</CardTitle>
          <CardDescription>
            Tìm theo nơi đi, nơi đến hoặc ngày bay
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
            <Button
              onClick={handleSearch}
              className="w-full md:w-auto mt-4"
              disabled={isSearching}
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isSearching && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            Đang tìm chuyến bay phù hợp...
          </p>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && !isSearching && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Kết quả tìm kiếm</h3>
            <p className="text-sm text-gray-600">
              Tìm thấy {searchResults.length} chuyến bay
            </p>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Plane className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-semibold mb-2">Không tìm thấy chuyến bay</h4>
                <p className="text-gray-600">
                  Vui lòng thử lại với các tiêu chí tìm kiếm khác
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchResults.map((flight) => {
                const s1 = flight.seatSummary?.[0]?.availableSeats || 0;
                const s2 = flight.seatSummary?.[1]?.availableSeats || 0;
                const s3 = flight.seatSummary?.[2]?.availableSeats || 0;
                const availableSeats = s1 + s2 + s3;

                const canBook = flight.status === "OPEN" && availableSeats > 0;

                return (
                  <Card key={flight.id} className={!canBook ? "opacity-75" : ""}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Plane className="w-12 h-12 text-blue-600" />
                          <div>
                            <CardTitle className="text-lg">ID: {flight.id}</CardTitle>
                            <CardDescription className="text-3xl">
                              {flight.route ? `${flight.route.origin} → ${flight.route.destination}` : '—'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(flight.status)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Flight Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">Khởi hành</p>
                          <p className="text-lg font-semibold">
                            {formatTimeDisplay(flight.departureTime)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {flight.departureTime ? new Date(flight.departureTime).toLocaleDateString("vi-VN") : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">Hạ cánh</p>
                          <p className="text-lg font-semibold">
                            {formatTimeDisplay(flight.arrivalTime)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleDateString("vi-VN") : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">Chỗ trống</p>
                          <p className="text-lg font-semibold text-green-600">
                            {availableSeats ? availableSeats : "0"}
                          </p>
                          <p className="text-xs text-gray-500">
                            / {flight.aircraft?.seatCapacity || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">Máy bay</p>
                          <p className="text-lg font-semibold">
                            {flight.aircraft?.type || "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {flight.aircraft?.registrationNumber || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Status Alerts */}
                      {flight.status === "DELAYED" && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-yellow-800">Chuyến bay bị chậm</p>
                            <p className="text-sm text-yellow-700">
                              Hành khách sẽ được thông báo qua email và SMS
                            </p>
                          </div>
                        </div>
                      )}

                      {flight.status === "CANCELED" && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
                          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-red-800">Chuyến bay đã bị hủy</p>
                            <p className="text-sm text-red-700">
                              Hành khách có thể đổi hoặc hoàn vé
                            </p>
                          </div>
                        </div>
                      )}

                      {flight.status === "FULL" && (
                        <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-orange-800">Hết chỗ</p>
                            <p className="text-sm text-orange-700">
                              Chuyến bay này đã hết vé
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {canBook ? (
                          <Button
                            onClick={() => setSelectedFlight(flight)}
                            className="flex-1"
                          >
                            Đặt vé
                          </Button>
                        ) : (
                          <Button
                            disabled
                            variant="secondary"
                            className="flex-1"
                          >
                            Không thể đặt vé
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}