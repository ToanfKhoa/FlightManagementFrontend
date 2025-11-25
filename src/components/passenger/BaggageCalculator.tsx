import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Luggage } from "lucide-react";
import { formatCurrency, calculateBaggageFee } from "../../lib/mockData";

export function BaggageCalculator() {
  const [seatClass, setSeatClass] = useState<"economy" | "business" | "first">("economy");
  const [carryOnWeight, setCarryOnWeight] = useState(0);
  const [checkedWeight, setCheckedWeight] = useState(0);

  const limits = {
    carryOn: 7,
    checked: {
      economy: 20,
      business: 30,
      first: 40,
    },
  };

  const fee = calculateBaggageFee(seatClass, carryOnWeight, checkedWeight);
  const carryOnExcess = Math.max(0, carryOnWeight - limits.carryOn);
  const checkedExcess = Math.max(0, checkedWeight - limits.checked[seatClass]);
  const totalExcess = carryOnExcess + checkedExcess;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Luggage className="w-6 h-6" />
            Tính phí hành lý
          </CardTitle>
          <CardDescription>
            Tính toán phí hành lý vượt mức dựa trên hạng vé và trọng lượng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seat Class Selection */}
          <div className="space-y-2">
            <Label>Hạng vé</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSeatClass("economy")}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    seatClass === "economy"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <p className="font-semibold">Phổ Thông</p>
                <p className="text-sm text-gray-600 mt-1">20 kg ký gửi</p>
              </button>
              <button
                onClick={() => setSeatClass("business")}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    seatClass === "business"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <p className="font-semibold">Thương Gia</p>
                <p className="text-sm text-gray-600 mt-1">30 kg ký gửi</p>
              </button>
              <button
                onClick={() => setSeatClass("first")}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    seatClass === "first"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <p className="font-semibold">Hạng Nhất</p>
                <p className="text-sm text-gray-600 mt-1">40 kg ký gửi</p>
              </button>
            </div>
          </div>

          <Separator />

          {/* Baggage Inputs */}
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
              />
              {carryOnExcess > 0 && (
                <p className="text-sm text-red-600">Vượt quá: {carryOnExcess} kg</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checked">
                Hành lý ký gửi (kg)
                <span className="text-gray-500 ml-2">
                  Cho phép: {limits.checked[seatClass]} kg
                </span>
              </Label>
              <Input
                id="checked"
                type="number"
                min="0"
                max="100"
                value={checkedWeight}
                onChange={(e) => setCheckedWeight(Number(e.target.value))}
              />
              {checkedExcess > 0 && (
                <p className="text-sm text-red-600">Vượt quá: {checkedExcess} kg</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Calculation Result */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3>Kết quả tính toán</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng trọng lượng vượt mức:</span>
                <span className="font-semibold">{totalExcess} kg</span>
              </div>

              {totalExcess > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Làm tròn lên (5 kg):</span>
                    <span className="font-semibold">
                      {Math.ceil(totalExcess / 5) * 5} kg
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đơn giá:</span>
                    <span className="font-semibold">100,000đ / 5 kg</span>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Phí hành lý vượt mức:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {fee > 0 ? formatCurrency(fee) : "0đ"}
                </span>
              </div>
            </div>

            {fee === 0 && totalExcess === 0 && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                <p className="text-green-800">
                  ✓ Hành lý của bạn nằm trong giới hạn cho phép
                </p>
              </div>
            )}

            {fee === 0 && totalExcess > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                <p className="text-blue-800">
                  Nhập trọng lượng hành lý để tính phí
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-sm">Quy định hành lý:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Hành lý xách tay: Tối đa 7 kg</li>
              <li>Hành lý ký gửi Phổ thông: Tối đa 20 kg</li>
              <li>Hành lý ký gửi Thương gia: Tối đa 30 kg</li>
              <li>Hành lý ký gửi Hạng nhất: Tối đa 40 kg</li>
              <li>Phí vượt mức: 100,000đ / 5 kg (làm tròn lên)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
