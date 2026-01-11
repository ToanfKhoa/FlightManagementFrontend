import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, Armchair } from "lucide-react";
import { generateSeatMap, formatCurrency } from "../../lib/mockData";
import { BookingConfirmation } from "./BookingConfirmation";
import type { Flight, Seat } from "../../lib/mockData";

interface SeatSelectionProps {
  flight: Flight;
  userId: string;
  onBack: () => void;
}

export function SeatSelection({ flight, userId, onBack }: SeatSelectionProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const seatMap = generateSeatMap(flight.id, flight);
    setSeats(seatMap);
  }, [flight]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat);
    }
  };

  const getSeatsByClass = (seatClass: Seat["class"]) => {
    return seats.filter((s) => s.class === seatClass);
  };

  const renderSeatGrid = (classSeats: Seat[], columns: number) => {
    return (
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {classSeats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => handleSeatClick(seat)}
            disabled={seat.status !== "available"}
            className={`
              aspect-square rounded-lg border-2 flex items-center justify-center text-sm transition-all
              ${seat.status === "available"
                ? "border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-500 cursor-pointer"
                : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
              }
              ${selectedSeat?.id === seat.id
                ? "border-blue-500 bg-blue-100 ring-2 ring-blue-300"
                : ""
              }
            `}
          >
            <div className="text-center">
              <Armchair className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs">{seat.seatNumber}</div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  if (showConfirmation && selectedSeat) {
    return (
      <BookingConfirmation
        flight={flight}
        seat={selectedSeat}
        userId={userId}
        onBack={() => setShowConfirmation(false)}
        onComplete={onBack}
      />
    );
  }

  const firstClassSeats = getSeatsByClass("first");
  const businessClassSeats = getSeatsByClass("business");
  const economyClassSeats = getSeatsByClass("economy");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h2>Chọn ghế - {flight.flightCode}</h2>
          <p className="text-sm text-gray-600">{flight.route}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* First Class */}
          {firstClassSeats.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="default">Hạng Nhất</Badge>
                  </CardTitle>
                  <span>{formatCurrency(flight.prices.first)}</span>
                </div>
              </CardHeader>
              <CardContent>{renderSeatGrid(firstClassSeats, 4)}</CardContent>
            </Card>
          )}

          {/* Business Class */}
          {businessClassSeats.length > 0 && flight.prices.business > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">Thương Gia</Badge>
                  </CardTitle>
                  <span>{formatCurrency(flight.prices.business)}</span>
                </div>
              </CardHeader>
              <CardContent>{renderSeatGrid(businessClassSeats, 4)}</CardContent>
            </Card>
          )}

          {/* Economy Class */}
          {economyClassSeats.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Phổ Thông</Badge>
                  </CardTitle>
                  <span>{formatCurrency(flight.prices.economy)}</span>
                </div>
              </CardHeader>
              <CardContent>{renderSeatGrid(economyClassSeats, 6)}</CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chú thích</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-green-300 bg-green-50" />
                <span className="text-sm">Ghế trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-gray-300 bg-gray-100" />
                <span className="text-sm">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-blue-500 bg-blue-100" />
                <span className="text-sm">Ghế đang chọn</span>
              </div>
            </CardContent>
          </Card>

          {selectedSeat && (
            <Card>
              <CardHeader>
                <CardTitle>Ghế đã chọn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Số ghế</p>
                  <p className="text-2xl font-bold">{selectedSeat.seatNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạng</p>
                  <p>
                    {selectedSeat.class === "first"
                      ? "Hạng Nhất"
                      : selectedSeat.class === "business"
                        ? "Thương Gia"
                        : "Phổ Thông"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá vé</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(selectedSeat.price)}
                  </p>
                </div>
                <Button className="w-full" onClick={() => setShowConfirmation(true)}>
                  Tiếp tục đặt vé
                </Button>
              </CardContent>
            </Card>
          )}

          {!selectedSeat && (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Chọn một ghế để tiếp tục
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
