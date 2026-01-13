import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Users, Plus, AlertTriangle, Plane, PlaneTakeoff, Edit, Download } from "lucide-react";
import { flightService } from "../../services/flightService";
import employeeService from "../../services/employeeService";
import type { Employee, EmployeePosition } from "../../types/employeeType";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import type { Flight } from "../../types/flightType";
import { toast } from "sonner";
import { exportCrewToExcel } from "../../utils/excelExport";

export function CrewManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedPosition, setSelectedPosition] = useState<EmployeePosition | "ALL">("ALL");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState<EmployeePosition>("PILOT");
  const [selectedFlightId, setSelectedFlightId] = useState("");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPosition, setEditPosition] = useState<EmployeePosition>("PILOT");
  const [editWorkExperience, setEditWorkExperience] = useState("");

  const handleAddCrew = async (employeeData: Employee) => {
    try {
      /*
      const maxHours = getMaxHoursByPosition(newCrewRole);
      const newEmployee: Partial<Employee> = {
        fullName: newCrewName.trim(),
        position: newCrewRole,
        monthlyHours: 0,
        maxHours,
        assignments: [],
        workExperience: "",
        totalFlightHours: 0,
      };

      await employeeService.createEmployee(newEmployee);
      setShowAddDialog(false);
      setNewCrewName("");
      setNewCrewRole("PILOT");
      */
      // The employee is already created by AddEmployeeDialog
      toast.success("Thêm thành viên mới thành công!");
      fetchEmployees(); // Refresh the list
    } catch (error) {
      toast.error("Lỗi khi thêm thành viên mới");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // Delay 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchEmployees();
  }, [page, size, debouncedSearch, selectedPosition]);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const data = await flightService.getAll();
      //setFlights(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách chuyến bay");
    }
  };

  const getMaxHoursByPosition = (position: EmployeePosition): number => {
    switch (position) {
      case 'PILOT':
      case 'COPILOT':
        return 100;
      case 'ATTENDANT':
        return 80;
      default:
        return 80;
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await employeeService.getAllEmployees({
        page: page,
        size: size,
        search: debouncedSearch,
        position: selectedPosition === "ALL" ? "" : selectedPosition,
        sort: "id,desc"
      })

      if (res?.data) {
        setEmployees(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
      }
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  const handleAssignFlight = async () => {
    if (!selectedEmployee || !selectedFlightId) return;

    const flight = flights.find(f => f.id.toString() === selectedFlightId);
    if (!flight) return;

    // Check if already assigned
    if (selectedEmployee.assignments.includes(flight.id.toString())) {
      toast.error("Thành viên đã được phân công cho chuyến bay này!");
      return;
    }

    // Check hour limits
    const estimatedHours = 8; // Estimate 8 hours per flight
    const newTotalHours = selectedEmployee.monthlyHours + estimatedHours;

    if (newTotalHours > selectedEmployee.maxHours) {
      toast.error(`Không thể phân công! Sẽ vượt quá giới hạn giờ bay (${selectedEmployee.maxHours}h)`);
      return;
    }

    try {
      const updatedEmployee: Partial<Employee> = {
        ...selectedEmployee,
        assignments: [...selectedEmployee.assignments, flight.id.toString()],
        monthlyHours: newTotalHours,
      };

      await employeeService.updateEmployee(selectedEmployee.id.toString(), updatedEmployee);
      setShowAssignDialog(false);
      setSelectedEmployee(null);
      setSelectedFlightId("");
      toast.success(`Đã phân công ${selectedEmployee.fullName} cho chuyến bay ${flight.id}`);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      toast.error("Lỗi khi phân công chuyến bay");
    }
  };

  const handleRemoveAssignment = async (crewId: number, flightCode: string) => {
    const employee = employees.find(e => e.id === crewId);
    if (!employee) return;

    try {
      const updatedEmployee: Partial<Employee> = {
        ...employee,
        assignments: employee.assignments.filter((a) => a !== flightCode),
        monthlyHours: Math.max(0, employee.monthlyHours - 8), // Rough estimate
      };

      await employeeService.updateEmployee(crewId.toString(), updatedEmployee);
      toast.success("Đã xóa phân công");
      fetchEmployees(); // Refresh the list
    } catch (error) {
      toast.error("Lỗi khi xóa phân công");
    }
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployeeForEdit) return;

    const maxHours = getMaxHoursByPosition(editPosition);
    const updatedEmployee: Partial<Employee> = {
      fullName: editFullName.trim(),
      position: editPosition,
      workExperience: editWorkExperience,
      maxHours,
    };

    try {
      await employeeService.updateEmployee(selectedEmployeeForEdit.id.toString(), updatedEmployee);
      setShowEditDialog(false);
      setSelectedEmployeeForEdit(null);
      toast.success("Cập nhật thông tin thành công!");
      fetchEmployees();
    } catch (error) {
      toast.error("Lỗi khi cập nhật thông tin");
    }
  };

  const getHoursPercentage = (member: Employee) => {
    return (member.monthlyHours / member.maxHours) * 100;
  };

  const isOverLimit = (member: Employee) => {
    return member.monthlyHours > member.maxHours;
  };

  const isNearLimit = (member: Employee) => {
    return member.monthlyHours >= member.maxHours * 0.9 && member.monthlyHours <= member.maxHours;
  };

  const getAvailableFlights = () => {
    return flights.filter(f => f.status === "OPEN" || f.status === "FULL");
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

        <Button onClick={() => {
          const success = exportCrewToExcel(employees);
          if (success) {
            toast.success("Xuất file Excel thành công");
          } else {
            toast.error("Lỗi khi xuất file Excel");
          }
        }}>
          <Download className="w-4 h-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Search & actions */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Tìm kiếm theo họ tên..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
        />
        {/*filter*/}
        <select
          className="border p-2 rounded"
          value={selectedPosition}
          onChange={(e) => { setSelectedPosition(e.target.value as EmployeePosition); setPage(0); }}
        >
          <option value="ALL">Tất cả</option>
          <option value="PILOT">Phi công</option>
          <option value="COPILOT">Cơ phó</option>
          <option value="ATTENDANT">Tiếp viên</option>
          <option value="OPERATOR">Nhân viên điều hành</option>
          <option value="TICKETING">Nhân viên vé</option>
          <option value="OTHER">Khác</option>
        </select>

        <AddEmployeeDialog
          onAddEmployee={handleAddCrew}
          trigger={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm thành viên
            </Button>
          }
        />

      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số phi công</CardDescription>
            <CardTitle className="text-3xl">
              {employees.filter((c) => c.position === "PILOT" || c.position === "COPILOT").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số tiếp viên</CardDescription>
            <CardTitle className="text-3xl">
              {employees.filter((c) => c.position === "ATTENDANT").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cảnh báo giờ bay</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {employees.filter((c) => isNearLimit(c) || isOverLimit(c)).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div> */}

      {/* Crew List */}
      <div className="space-y-4">
        {employees.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {member.fullName}
                    <Badge variant={member.position === "PILOT" ? "default" : "secondary"}>
                      {member.position === "PILOT" ? "Phi công" : member.position === "ATTENDANT" ? "Tiếp viên" : member.position === "COPILOT" ? "Cơ phó" : "Nhân viên quầy vé"}
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
                      setSelectedEmployeeForEdit(member);
                      setEditFullName(member.fullName);
                      setEditPosition(member.position);
                      setEditWorkExperience(member.workExperience || "");
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  { /* <Button
                      size="sm"
                      variant="outline"
                      disabled={isOverLimit(member)}
                      onClick={() => {
                        setSelectedEmployee(member);
                        setShowAssignDialog(true);
                      }}
                    >
                      <PlaneTakeoff className="w-4 h-4 mr-2" />
                      Phân công chuyến bay
                  </Button> */}
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
                    ⚠️ Gần đạt giới hạn: còn {member.maxHours - member.monthlyHours} giờ bay
                  </p>
                )}
              </div>

              {/* Assignments */}
              <div>
                <p className="text-sm font-semibold mb-2">
                  Chuyến bay đang phân công ({member.assignments?.length})
                </p>
                {member.assignments?.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có chuyến bay nào</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {member.assignments?.map((flightCode) => (
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

      {loading && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Đang tải danh sách nhân viên...</p>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Hiển thị {employees.length} / {totalElements} nhân viên — Trang {page + 1} / {totalPages || 1}</div>
        <div className="flex gap-2">
          <Button disabled={page <= 0 || loading} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</Button>
          <Button disabled={page >= (totalPages - 1) || loading} onClick={() => setPage(p => Math.min((totalPages - 1) || p + 1, p + 1))}>Next</Button>
        </div>
      </div>

      {/* Assign Flight Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phân công chuyến bay</DialogTitle>
            <DialogDescription>
              Phân công chuyến bay cho {selectedEmployee?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEmployee && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vai trò:</span>
                    <span className="font-semibold">
                      {selectedEmployee.position === "PILOT" ? "Phi công" : selectedEmployee.position === "ATTENDANT" ? "Tiếp viên" : selectedEmployee.position === "COPILOT" ? "Cơ phó" : "Nhân viên quầy vé"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giờ bay hiện tại:</span>
                    <span className="font-semibold">
                      {selectedEmployee.monthlyHours} / {selectedEmployee.maxHours} giờ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chuyến bay đã phân công:</span>
                    <span className="font-semibold">{selectedEmployee.assignments?.length}</span>
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
                        {flight.id} - {flight.route.origin} - {flight.route.destination} ({flight.date ? new Date(flight.date).toLocaleDateString("vi-VN") : 'N/A'} {flight.departureTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
                  <p className="text-blue-800">
                    💡 Mỗi chuyến bay ước tính 8 giờ. Giờ bay sau khi phân công: {selectedEmployee.monthlyHours + 8} giờ
                  </p>
                  <p className="text-blue-800">
                    {isOverLimit(selectedEmployee) || (selectedEmployee.monthlyHours + 8 > selectedEmployee.maxHours)
                      ? "⚠️ Vượt quá giới hạn giờ bay!"
                      : `✅ Phân công này vẫn trong giới hạn giờ bay (${selectedEmployee.maxHours} giờ).`}
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAssignFlight}
                  disabled={!selectedFlightId || selectedEmployee.monthlyHours + 8 > selectedEmployee.maxHours}
                >
                  Xác nhận phân công
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin cho {selectedEmployeeForEdit?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Họ tên</Label>
              <Input
                id="editFullName"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPosition">Vị trí</Label>
              {/* <Select value={editPosition} onValueChange={(value) => setEditPosition(value as EmployeePosition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PILOT">Phi công</SelectItem>
                  <SelectItem value="COPILOT">Cơ phó</SelectItem>
                  <SelectItem value="ATTENDANT">Tiếp viên</SelectItem>
                  <SelectItem value="OPERATOR">Nhân viên điều hành</SelectItem>
                  <SelectItem value="TICKETING">Nhân viên vé</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select> */}

              <select
                className="border p-2 rounded"
                value={editPosition}
                onChange={(e) => { setEditPosition(e.target.value as EmployeePosition); setPage(0); }}
              >
                <option value="PILOT">Phi công</option>
                <option value="COPILOT">Cơ phó</option>
                <option value="ATTENDANT">Tiếp viên</option>
                <option value="OPERATOR">Nhân viên điều hành</option>
                <option value="TICKETING">Nhân viên vé</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editWorkExperience">Kinh nghiệm làm việc</Label>
              <Textarea
                id="editWorkExperience"
                value={editWorkExperience}
                onChange={(e) => setEditWorkExperience(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleEditEmployee}>
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}