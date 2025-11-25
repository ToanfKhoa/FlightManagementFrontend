import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Users, Plus, AlertTriangle, Plane, PlaneTakeoff } from "lucide-react";
import { mockCrew, mockFlights } from "../../lib/mockData";
import { toast } from "sonner";
import type { CrewMember, Flight } from "../../lib/mockData";

export function CrewManagement() {
  const [crew, setCrew] = useState<CrewMember[]>(mockCrew);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMember | null>(null);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState<"pilot" | "attendant">("pilot");
  const [selectedFlightId, setSelectedFlightId] = useState("");

  const handleAddCrew = () => {
    const maxHours = newCrewRole === "pilot" ? 100 : 80;
    const newCrew: CrewMember = {
      id: "c" + (crew.length + 1),
      name: newCrewName,
      role: newCrewRole,
      monthlyHours: 0,
      maxHours,
      assignments: [],
    };

    setCrew([...crew, newCrew]);
    setShowAddDialog(false);
    setNewCrewName("");
    toast.success("Thêm thành viên mới thành công!");
  };

  const handleAssignFlight = () => {
    if (!selectedCrewMember || !selectedFlightId) return;

    const flight = mockFlights.find(f => f.id === selectedFlightId);
    if (!flight) return;

    // Check if already assigned
    if (selectedCrewMember.assignments.includes(flight.flightCode)) {
      toast.error("Thành viên đã được phân công cho chuyến bay này!");
      return;
    }

    // Check hour limits
    const estimatedHours = 8; // Estimate 8 hours per flight
    const newTotalHours = selectedCrewMember.monthlyHours + estimatedHours;
    
    if (newTotalHours > selectedCrewMember.maxHours) {
      toast.error(`Không thể phân công! Sẽ vượt quá giới hạn giờ bay (${selectedCrewMember.maxHours}h)`);
      return;
    }

    const updatedCrew = crew.map((c) => {
      if (c.id === selectedCrewMember.id) {
        return {
          ...c,
          assignments: [...c.assignments, flight.flightCode],
          monthlyHours: newTotalHours,
        };
      }
      return c;
    });

    setCrew(updatedCrew);
    setShowAssignDialog(false);
    setSelectedCrewMember(null);
    setSelectedFlightId("");
    toast.success(`Đã phân công ${selectedCrewMember.name} cho chuyến bay ${flight.flightCode}`);
  };

  const handleRemoveAssignment = (crewId: string, flightCode: string) => {
    const updatedCrew = crew.map((c) => {
      if (c.id === crewId) {
        return {
          ...c,
          assignments: c.assignments.filter((a) => a !== flightCode),
          monthlyHours: Math.max(0, c.monthlyHours - 8), // Rough estimate
        };
      }
      return c;
    });

    setCrew(updatedCrew);
    toast.success("Đã xóa phân công");
  };

  const getHoursPercentage = (member: CrewMember) => {
    return (member.monthlyHours / member.maxHours) * 100;
  };

  const isOverLimit = (member: CrewMember) => {
    return member.monthlyHours > member.maxHours;
  };

  const isNearLimit = (member: CrewMember) => {
    return member.monthlyHours >= member.maxHours * 0.9 && member.monthlyHours <= member.maxHours;
  };

  const getAvailableFlights = () => {
    return mockFlights.filter(f => f.status === "open" || f.status === "full");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Quản lý phi hành đoàn</h2>
          <p className="text-sm text-gray-600 mt-1">
            Phân công và theo dõi giờ bay của phi công và tiếp viên
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm thành viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm thành viên phi hành đoàn</DialogTitle>
              <DialogDescription>
                Nhập thông tin thành viên mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <select
                  id="role"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newCrewRole}
                  onChange={(e) => setNewCrewRole(e.target.value as "pilot" | "attendant")}
                >
                  <option value="pilot">Phi công</option>
                  <option value="attendant">Tiếp viên</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleAddCrew} disabled={!newCrewName}>
                Thêm thành viên
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số phi công</CardDescription>
            <CardTitle className="text-3xl">
              {crew.filter((c) => c.role === "pilot").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số tiếp viên</CardDescription>
            <CardTitle className="text-3xl">
              {crew.filter((c) => c.role === "attendant").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cảnh báo giờ bay</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {crew.filter((c) => isNearLimit(c) || isOverLimit(c)).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Crew List */}
      <div className="space-y-4">
        {crew.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {member.name}
                    <Badge variant={member.role === "pilot" ? "default" : "secondary"}>
                      {member.role === "pilot" ? "Phi công" : "Tiếp viên"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">ID: {member.id}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {(isOverLimit(member) || isNearLimit(member)) && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {isOverLimit(member) ? "Vượt giới hạn" : "Gần đạt giới hạn"}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCrewMember(member);
                      setShowAssignDialog(true);
                    }}
                  >
                    <PlaneTakeoff className="w-4 h-4 mr-2" />
                    Phân công chuyến bay
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hours Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giờ bay trong tháng</span>
                  <span className="font-semibold">
                    {member.monthlyHours} / {member.maxHours} giờ
                  </span>
                </div>
                <Progress
                  value={getHoursPercentage(member)}
                  className={
                    isOverLimit(member)
                      ? "bg-red-100"
                      : isNearLimit(member)
                      ? "bg-yellow-100"
                      : ""
                  }
                />
                {isOverLimit(member) && (
                  <p className="text-sm text-red-600">
                    ⚠️ Vượt quá giới hạn {member.monthlyHours - member.maxHours} giờ
                  </p>
                )}
                {isNearLimit(member) && (
                  <p className="text-sm text-yellow-600">
                    ⚠️ Còn {member.maxHours - member.monthlyHours} giờ trước khi đạt giới hạn
                  </p>
                )}
              </div>

              {/* Assignments */}
              <div>
                <p className="text-sm font-semibold mb-2">
                  Chuyến bay phân công ({member.assignments.length})
                </p>
                {member.assignments.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có chuyến bay nào</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {member.assignments.map((flightCode) => (
                      <div
                        key={flightCode}
                        className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <Plane className="w-3 h-3" />
                        <span className="text-sm">{flightCode}</span>
                        <button
                          onClick={() => handleRemoveAssignment(member.id, flightCode)}
                          className="ml-1 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Flight Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phân công chuyến bay</DialogTitle>
            <DialogDescription>
              Phân công chuyến bay cho {selectedCrewMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCrewMember && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vai trò:</span>
                    <span className="font-semibold">
                      {selectedCrewMember.role === "pilot" ? "Phi công" : "Tiếp viên"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giờ bay hiện tại:</span>
                    <span className="font-semibold">
                      {selectedCrewMember.monthlyHours} / {selectedCrewMember.maxHours} giờ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chuyến bay đã phân công:</span>
                    <span className="font-semibold">{selectedCrewMember.assignments.length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flight">Chọn chuyến bay</Label>
                  <select
                    id="flight"
                    className="w-full px-3 py-2 border rounded-md"
                    value={selectedFlightId}
                    onChange={(e) => setSelectedFlightId(e.target.value)}
                  >
                    <option value="">-- Chọn chuyến bay --</option>
                    {getAvailableFlights().map((flight) => (
                      <option key={flight.id} value={flight.id}>
                        {flight.flightCode} - {flight.route} ({new Date(flight.date).toLocaleDateString("vi-VN")} {flight.departureTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
                  <p className="text-blue-800">
                    💡 Mỗi chuyến bay ước tính 8 giờ. Giờ bay sau khi phân công: {selectedCrewMember.monthlyHours + 8} giờ
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleAssignFlight}
                  disabled={!selectedFlightId}
                >
                  Xác nhận phân công
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}