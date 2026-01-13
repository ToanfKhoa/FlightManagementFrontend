import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Pencil, Plane, AlertTriangle, Clock, X, Plus, Download, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { exportFlightsToExcel } from "../../utils/excelExport";
import { flightService } from "../../services/flightService";
import { aircraftService } from "../../services/aircraftService";
import { routeService } from "../../services/routeService";
import { assignmentService } from "../../services/assignmentService";
import { employeeService } from "../../services/employeeService";
import type { Flight, Route, FlightStatus, FlightsPageResponse, FlightSeat, SeatSummary, CreateRouteRequest } from "../../types/flightType";
import type { Aircraft } from "../../types/aircraftType";
import type { Employee } from "../../types/employeeType";
import type { Assignment } from "../../types/assignmentType";
import type { ApiResponse } from "../../types/commonType";

export function FlightOperations() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [showDelayDialog, setShowDelayDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [newRoute, setNewRoute] = useState<CreateRouteRequest>({
    origin: '',
    destination: '',
    external: false
  });
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFlight, setNewFlight] = useState({
    priceSeatClass: [
      { seatClass: 'ECONOMY', price: 1500000 },
      { seatClass: 'BUSINESS', price: 3000000 },
      { seatClass: 'FIRST_CLASS', price: 5000000 }
    ] as FlightSeat[],
    seatSummary: [] as SeatSummary[],
    routeId: 1,
    aircraftId: 1,
    status: 'OPEN' as FlightStatus,
    departureTime: '',
    arrivalTime: '',
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedFlightForAssign, setSelectedFlightForAssign] = useState<Flight | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeePage, setEmployeePage] = useState(0);
  const [employeeTotalPages, setEmployeeTotalPages] = useState(0);
  const [existingAssignments, setExistingAssignments] = useState<Assignment[]>([]);
  const [editFlightData, setEditFlightData] = useState({
    priceSeatClass: [
      { seatClass: 'ECONOMY', price: 1500000 },
      { seatClass: 'BUSINESS', price: 3000000 },
      { seatClass: 'FIRST_CLASS', price: 5000000 }
    ] as FlightSeat[],
    seatSummary: [
      { seatClass: 'ECONOMY', availableSeats: 1 },
      { seatClass: 'BUSINESS', availableSeats: 1 },
      { seatClass: 'FIRST_CLASS', availableSeats: 1 }
    ] as SeatSummary[],
    routeId: 1,
    aircraftId: 1,
    status: 'OPEN' as FlightStatus,
    departureTime: '',
    arrivalTime: '',
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const loadEmployees = async (page: number = 0) => {
    try {
      setLoadingEmployees(true);
      const res = await employeeService.getAllEmployees({ page, size: 10 });
      if (res.data) {
        const sortedEmployees = res.data.content.sort((a, b) => a.position.localeCompare(b.position));
        setEmployees(sortedEmployees);
        setEmployeeTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách nhân viên");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadExistingAssignments = async (flightId: number) => {
    try {
      const res = await assignmentService.getAll({ all: true, filter: `flight.id==${flightId}` });
      if (res.data) {
        setExistingAssignments(res.data.content);
        const assignedEmployeeIds = res.data.content.map((assignment: Assignment) => assignment.employee.id);
        setSelectedEmployeeIds(assignedEmployeeIds);
      }
    } catch (err) {
      console.error("Lỗi khi tải phân công hiện tại", err);
    }
  };

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const res = await flightService.getAll({
        page: page,
        size: size,
        search: debouncedSearch,
        status: selectedStatus === "ALL" ? "" : selectedStatus,
        sort: "updatedAt,desc"
      });

      const response = res as ApiResponse<FlightsPageResponse>;
      if (response?.data) {
        const flightsWithComputed = response.data.content.map(flight => ({
          ...flight,
          date: new Date(flight.departureTime).toISOString().split('T')[0],
          departureTimeDisplay: computeDisplayTime(flight.departureTime),
          arrivalTimeDisplay: computeDisplayTime(flight.arrivalTime),
        }));
        setFlights(flightsWithComputed);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err: any) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to first page on new search
    }, 500); // delay 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFlights();
  }, [page, size, debouncedSearch, selectedStatus]);

  useEffect(() => {
    if (showAssignDialog && selectedFlightForAssign) {
      loadEmployees(employeePage);
      loadExistingAssignments(selectedFlightForAssign.id);
    }
  }, [showAssignDialog, selectedFlightForAssign, employeePage]);

  useEffect(() => {
    Promise.all([
      flightService.getAll({ all: true }),
      routeService.getAll(),
      aircraftService.getAll({ all: true, status: 'ACTIVE' }),
    ])
      .then(([allFlightsData, routesData, aircraftsData]) => {
        const allFlightsWithComputed = (allFlightsData.data.content as Flight[]).map(flight => ({
          ...flight,
          date: new Date(flight.departureTime).toISOString().split('T')[0],
          departureTimeDisplay: new Date(flight.departureTime).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          arrivalTimeDisplay: new Date(flight.departureTime).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        }));
        setAllFlights(allFlightsWithComputed);
        setRoutes(routesData);
        setAircrafts(aircraftsData as Aircraft[]);
        // Set default values to first items
        if (routesData.length > 0 && (aircraftsData as Aircraft[]).length > 0) {
          setNewFlight({
            priceSeatClass: [
              { seatClass: 'ECONOMY', price: 1500000 },
              { seatClass: 'BUSINESS', price: 3000000 },
              { seatClass: 'FIRST_CLASS', price: 5000000 }
            ],
            seatSummary: [
              { seatClass: 'ECONOMY', availableSeats: 1 },
              { seatClass: 'BUSINESS', availableSeats: 1 },
              { seatClass: 'FIRST_CLASS', availableSeats: 1 }
            ],
            routeId: routesData[0].id,
            aircraftId: (aircraftsData as Aircraft[])[0].id,
            status: 'OPEN',
            departureTime: '',
            arrivalTime: '',
          });
        }
      })
      .catch(() => {
        toast.error("Không tải được dữ liệu");
      });
  }, []);

  const handleCreateRoute = async () => {
    try {
      // Check for duplicate route
      const existingRoute = routes.find(route =>
        route.origin.toLowerCase() === newRoute.origin.toLowerCase() &&
        route.destination.toLowerCase() === newRoute.destination.toLowerCase() &&
        route.external === newRoute.external
      );

      if (existingRoute) {
        toast.error("Tuyến bay này đã tồn tại. Vui lòng kiểm tra lại thông tin!");
        return;
      }

      // Validate required fields
      if (!newRoute.origin || !newRoute.destination) {
        toast.error("Vui lòng nhập đầy đủ thông tin điểm đi và điểm đến");
        return;
      }

      const createdRoute = await routeService.create(newRoute);
      setRoutes(prev => [...prev, createdRoute]);
      toast.success("Tuyến bay mới đã được tạo thành công");
      setShowRouteDialog(false);
      setNewRoute({
        origin: '',
        destination: '',
        external: false
      });
    } catch (error) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
    }
  };

  const handleDelayFlight = () => {
    if (!selectedFlight) return;

    setFlights((prev) =>
      prev.map((f) =>
        f.id === selectedFlight.id ? { ...f, status: "DELAYED" } : f
      )
    );
    setAllFlights((prev) =>
      prev.map((f) =>
        f.id === selectedFlight.id ? { ...f, status: "DELAYED" } : f
      )
    );

    toast.success(
      `Chuyến bay ${selectedFlight.id} đã được đánh dấu chậm ${delayMinutes} phút`
    );
    setSelectedFlight(null);
    setShowDelayDialog(false);
  };

  const handleCancelFlight = (flight: Flight) => {
    setFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "CANCELED" } : f
      )
    );
    setAllFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "CANCELED" } : f
      )
    );

    toast.success(
      `Chuyến bay ${flight.id} đã bị hủy. Hệ thống sẽ thông báo cho hành khách.`
    );
  };

  const handleReactivateFlight = (flight: Flight) => {
    setFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "OPEN" } : f
      )
    );
    setAllFlights((prev) =>
      prev.map((f) =>
        f.id === flight.id ? { ...f, status: "OPEN" } : f
      )
    );

    toast.success(`Chuyến bay ${flight.id} đã được kích hoạt lại`);
  };

  const computeDisplayTime = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleCreateFlight = async () => {
    try {
      const formatToISO = (datetime: string) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toISOString();
      };

      const newFlightData = await flightService.create({
        routeId: newFlight.routeId,
        aircraftId: newFlight.aircraftId,
        status: newFlight.status,
        priceSeatClass: newFlight.priceSeatClass,
        departureTime: formatToISO(newFlight.departureTime),
        arrivalTime: formatToISO(newFlight.arrivalTime),
      });
      const route = routes.find(r => r.id === (newFlightData as any).routeId) || newFlightData.route;
      const aircraft = aircrafts.find(a => a.id === (newFlightData as any).aircraftId) || newFlightData.aircraft;
      const flightWithDetails = {
        ...newFlightData,
        route,
        aircraft,
        status: newFlight.status,
        departureTimeDisplay: computeDisplayTime(newFlightData.departureTime),
        arrivalTimeDisplay: computeDisplayTime(newFlightData.arrivalTime),
      };
      setFlights((prev) => [...prev, flightWithDetails]);
      setAllFlights((prev) => [...prev, flightWithDetails]);
      toast.success("Chuyến bay mới đã được tạo thành công");
      setShowCreateDialog(false);
      setNewFlight({
        priceSeatClass: [
          { seatClass: 'ECONOMY', price: 1500000 },
          { seatClass: 'BUSINESS', price: 3000000 },
          { seatClass: 'FIRST_CLASS', price: 5000000 }
        ],
        seatSummary: [
          { seatClass: 'ECONOMY', availableSeats: 1 },
          { seatClass: 'BUSINESS', availableSeats: 1 },
          { seatClass: 'FIRST_CLASS', availableSeats: 1 }
        ] as SeatSummary[],
        routeId: routes[0]?.id || 1,
        aircraftId: aircrafts[0]?.id || 1,
        status: 'OPEN' as FlightStatus,
        departureTime: '',
        arrivalTime: '',
      });
    } catch (error) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
    }
  };


  const getStatusLabel = (status: Flight["status"]) => {
    const statusLabels: Record<string, string> = {
      open: "Đang mở",
      full: "Hết chỗ",
      delayed: "Chậm",
      canceled: "Đã hủy",
      completed: "Hoàn thành",
      departed: "Khởi hành",
    };
    return statusLabels[String(status ?? '').toLowerCase()] || String(status ?? '');
  };

  const handleAssignCrew = async () => {
    if (!selectedFlightForAssign || selectedEmployeeIds.length === 0) return;

    try {
      await assignmentService.assign({
        flightId: selectedFlightForAssign.id,
        employeeIds: selectedEmployeeIds,
      });
      toast.success("Phân công nhân viên thành công");
      setShowAssignDialog(false);
      setSelectedFlightForAssign(null);
      setSelectedEmployeeIds([]);
      setExistingAssignments([]);
      setEmployeePage(0);
    } catch (err) {
      toast.error("Phân công chưa đáp ứng quy định, vui lòng xem xét lại.");
    }
  };

  const handleUpdateFlight = async () => {
    if (!editingFlight) return;

    try {
      const formatToISO = (datetime: string) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toISOString();
      };

      const updatedData = await flightService.update(String(editingFlight.id), {
        priceSeatClass: editFlightData.priceSeatClass,
        routeId: editFlightData.routeId,
        aircraftId: editFlightData.aircraftId,
        status: editFlightData.status,
        departureTime: formatToISO(editFlightData.departureTime),
        arrivalTime: formatToISO(editFlightData.arrivalTime),
      });

      const route = routes.find(r => r.id === (updatedData as any).data.routeId) || updatedData.data.route;
      const aircraft = aircrafts.find(a => a.id === (updatedData as any).data.aircraftId) || updatedData.data.aircraft;

      setFlights((prev) =>
        prev.map((f) =>
          f.id === editingFlight.id ? {
            ...updatedData.data, route, aircraft,
            departureTimeDisplay: computeDisplayTime(editFlightData.departureTime),
            arrivalTimeDisplay: computeDisplayTime(editFlightData.arrivalTime),
          } : f
        )
      );
      setAllFlights((prev) =>
        prev.map((f) =>
          f.id === editingFlight.id ? {
            ...updatedData.data, route, aircraft,
            departureTimeDisplay: computeDisplayTime(editFlightData.departureTime),
            arrivalTimeDisplay: computeDisplayTime(editFlightData.arrivalTime),
          } : f
        )
      );

      toast.success("Cập nhật chuyến bay thành công");
      setShowEditDialog(false);
      setEditingFlight(null);
    } catch (error) {
      toast.error("Không thể cập nhật chuyến bay");
    }
  };

  const getStatusBadge = (status: Flight["status"]) => {
    const variants: Record<
      string,
      { variant: any; label: string }
    > = {
      open: { variant: "default", label: "Đang mở" },
      full: { variant: "secondary", label: "Hết chỗ" },
      delayed: { variant: "destructive", label: "Chậm" },
      canceled: { variant: "destructive", label: "Đã hủy" },
      completed: { variant: "secondary", label: "Hoàn thành" },
      departed: { variant: "secondary", label: "Khởi hành" },
    };

    const key = String(status ?? '').toLowerCase();
    const v = variants[key] ?? { variant: "default", label: key };
    return <Badge variant={v.variant}>{v.label}</Badge>;
  };


  console.log("Current Flight IDs:", flights.map(f => f.id));
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Điều hành bay</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý trạng thái chuyến bay, xử lý chậm/hủy chuyến
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            const success = exportFlightsToExcel(allFlights);
            if (success) {
              toast.success("Xuất file Excel thành công");
            } else {
              toast.error("Lỗi khi xuất file Excel");
            }
          }}>
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
            <DialogTrigger asChild>
              <Button>
                <MapPin className="w-4 h-4 mr-2" />
                Tạo tuyến bay mới
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo chuyến bay mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo chuyến bay mới</DialogTitle>
                <DialogDescription>
                  Chọn tuyến bay, máy bay và trạng thái cho chuyến bay mới
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="route">Tuyến bay</Label>
                    <select
                      className="border p-2 rounded w-full"
                      value={newFlight.routeId}
                      onChange={(e) => setNewFlight({ ...newFlight, routeId: parseInt(e.target.value) })}
                    >
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.origin} → {route.destination}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aircraft">Máy bay</Label>
                    <select
                      className="border p-2 rounded w-full"
                      value={newFlight.aircraftId}
                      onChange={(e) => setNewFlight({ ...newFlight, aircraftId: parseInt(e.target.value) })}
                    >
                      {aircrafts.map((aircraft) => (
                        <option key={aircraft.id} value={aircraft.id}>
                          {aircraft.type} ({aircraft.registrationNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Thời gian khởi hành</Label>
                    <Input
                      type="datetime-local"
                      id="departureTime"
                      value={newFlight.departureTime}
                      onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrivalTime">Thời gian đến</Label>
                    <Input
                      type="datetime-local"
                      id="arrivalTime"
                      value={newFlight.arrivalTime}
                      onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Giá theo hạng ghế</Label>
                  <div className="grid grid-cols-3 gap-4 border p-3 rounded">
                    <div>
                      <Label htmlFor="economy-price">Phổ thông</Label>
                      <Input
                        id="economy-price"
                        type="number"
                        value={newFlight.priceSeatClass[0].price}
                        onChange={(e) => {
                          const updated = [...newFlight.priceSeatClass];
                          updated[0].price = parseInt(e.target.value) || 0;
                          setNewFlight({ ...newFlight, priceSeatClass: updated });
                        }}
                        placeholder="Giá"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-price">Thương gia</Label>
                      <Input
                        id="business-price"
                        type="number"
                        value={newFlight.priceSeatClass[1].price}
                        onChange={(e) => {
                          const updated = [...newFlight.priceSeatClass];
                          updated[1].price = parseInt(e.target.value) || 0;
                          setNewFlight({ ...newFlight, priceSeatClass: updated });
                        }}
                        placeholder="Giá"
                      />
                    </div>
                    <div>
                      <Label htmlFor="first-class-price">Hạng nhất</Label>
                      <Input
                        id="first-class-price"
                        type="number"
                        value={newFlight.priceSeatClass[2].price}
                        onChange={(e) => {
                          const updated = [...newFlight.priceSeatClass];
                          updated[2].price = parseInt(e.target.value) || 0;
                          setNewFlight({ ...newFlight, priceSeatClass: updated });
                        }}
                        placeholder="Giá"
                      />
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateFlight}>
                  Tạo chuyến bay
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Flight Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyến bay</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chuyến bay {editingFlight?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-route">Tuyến bay</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={editFlightData.routeId}
                  onChange={(e) => setEditFlightData({ ...editFlightData, routeId: parseInt(e.target.value) })}
                >
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.origin} → {route.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-aircraft">Máy bay</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={editFlightData.aircraftId}
                  onChange={(e) => setEditFlightData({ ...editFlightData, aircraftId: parseInt(e.target.value) })}
                  disabled
                >
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.id} value={aircraft.id}>
                      {aircraft.type} ({aircraft.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-departureTime">Thời gian khởi hành</Label>
                <Input
                  type="datetime-local"
                  id="edit-departureTime"
                  value={editFlightData.departureTime}
                  onChange={(e) => setEditFlightData({ ...editFlightData, departureTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-arrivalTime">Thời gian đến</Label>
                <Input
                  type="datetime-local"
                  id="edit-arrivalTime"
                  value={editFlightData.arrivalTime}
                  onChange={(e) => setEditFlightData({ ...editFlightData, arrivalTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Giá theo hạng ghế</Label>
              <div className="grid grid-cols-3 gap-4 border p-3 rounded">
                <div>
                  <Label htmlFor="edit-economy-price">Phổ thông</Label>
                  <Input
                    id="edit-economy-price"
                    type="number"
                    value={editFlightData.priceSeatClass[0].price}
                    onChange={(e) => {
                      const updated = [...editFlightData.priceSeatClass];
                      updated[0].price = parseInt(e.target.value) || 0;
                      setEditFlightData({ ...editFlightData, priceSeatClass: updated });
                    }}
                    placeholder="Giá"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="edit-business-price">Thương gia</Label>
                  <Input
                    id="edit-business-price"
                    type="number"
                    value={editFlightData.priceSeatClass[1].price}
                    onChange={(e) => {
                      const updated = [...editFlightData.priceSeatClass];
                      updated[1].price = parseInt(e.target.value) || 0;
                      setEditFlightData({ ...editFlightData, priceSeatClass: updated });
                    }}
                    placeholder="Giá"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="edit-first-class-price">Hạng nhất</Label>
                  <Input
                    id="edit-first-class-price"
                    type="number"
                    value={editFlightData.priceSeatClass[2].price}
                    onChange={(e) => {
                      const updated = [...editFlightData.priceSeatClass];
                      updated[2].price = parseInt(e.target.value) || 0;
                      setEditFlightData({ ...editFlightData, priceSeatClass: updated });
                    }}
                    placeholder="Giá"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={handleUpdateFlight}>
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="flex gap-2 items-center mb-4">
        <Input
          placeholder="Tìm kiếm theo ID chuyến bay..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Dropdown Status */}
        <select
          className="border p-2 rounded"
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
        >
          <option value="">Tất cả</option>
          <option value="OPEN">Đang mở</option>
          <option value="FULL">Hết chỗ</option>
          <option value="DELAYED">Chậm</option>
          <option value="CANCELED">Đã hủy</option>
          <option value="DEPARTED">Khởi hành</option>
          <option value="COMPLETED">Hoàn thành</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng chuyến bay</CardDescription>
            <CardTitle className="text-3xl">{allFlights.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đang mở</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {allFlights.filter((f) => f.status === "OPEN").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hết chỗ</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {allFlights.filter((f) => f.status === "FULL").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Chậm</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {allFlights.filter((f) => f.status === "DELAYED").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đã hủy</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {allFlights.filter((f) => f.status === "CANCELED").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {loading ?
        (<div className="text-center py-10">Loading flights...</div>)
        :
        (
          <>
            <div className="space-y-4">
              {flights.map((flight) => (
                <Card key={flight.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="w-5 h-5" />
                      {flight.id}
                      {getStatusBadge(flight.status)}
                    </CardTitle>
                    <CardDescription>
                      <div className="mb-1">
                        <span className="text-lg font-extrabold text-foreground tracking-tight">
                          {flight.route ? `${flight.route.origin} → ${flight.route.destination}` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
                        <span>{flight.aircraft?.type}</span>
                        <span>•</span>
                        <span>{flight.aircraft?.registrationNumber}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Thời điểm khởi hành</p>
                        <p className="font-semibold">{flight.departureTimeDisplay ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Thời điểm hạ cánh</p>
                        <p className="font-semibold">{flight.arrivalTimeDisplay ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Chỗ trống</p>
                        <p className="font-semibold">
                          {flight.aircraft?.seatCapacity
                            ? flight.aircraft.seatCapacity
                            : '—'}
                        </p>
                      </div>
                    </div>

                    {flight.status === "DELAYED" && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-800">Chuyến bay bị chậm</p>
                          <p className="text-sm text-yellow-700">
                            Hành khách đã được thông báo qua email và SMS
                          </p>
                        </div>
                      </div>
                    )}

                    {flight.status === "CANCELED" && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
                        <X className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">Chuyến bay đã bị hủy</p>
                          <p className="text-sm text-red-700">
                            Hành khách đã được thông báo và có thể đổi/hoàn vé
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFlightForAssign(flight);
                          setShowAssignDialog(true);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Phân công
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingFlight(flight);

                          // Formart datetime
                          const isoToLocalInput = (iso: string) => {
                            if (!iso) return '';
                            const date = new Date(iso);
                            const pad = (n: number) => n.toString().padStart(2, '0');

                            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
                          };

                          // Group flightSeats by seatClass to get prices
                          const priceMap = flight.flightSeats.reduce((acc, seat) => {
                            acc[seat.seatClass] = seat.price;
                            return acc;
                          }, {} as Record<string, number>);

                          const priceSeatClass = [
                            { seatClass: 'ECONOMY', price: priceMap.ECONOMY || 0 },
                            { seatClass: 'BUSINESS', price: priceMap.BUSINESS || 0 },
                            { seatClass: 'FIRST_CLASS', price: priceMap.FIRST_CLASS || 0 }
                          ];

                          setEditFlightData({
                            priceSeatClass: priceSeatClass,
                            seatSummary: flight.seatSummary,
                            routeId: flight.route?.id ?? 1,
                            aircraftId: flight.aircraft?.id ?? 1,
                            status: flight.status,
                            departureTime: isoToLocalInput(flight.departureTime),
                            arrivalTime: isoToLocalInput(flight.arrivalTime),
                          });

                          setShowEditDialog(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                      {(flight.status !== "COMPLETED" && flight.status !== "CANCELED") && (
                        <>
                          <Dialog open={showDelayDialog} onOpenChange={setShowDelayDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedFlight(flight);
                                  setDelayMinutes(0);
                                  setShowDelayDialog(true);
                                }}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Báo chậm
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Báo chậm chuyến bay</DialogTitle>
                                <DialogDescription>
                                  Nhập thời gian chậm dự kiến. Hệ thống sẽ tự động thông báo cho hành khách.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="delay">Thời gian chậm (phút)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={delayMinutes}
                                    onChange={(e) =>
                                      setDelayMinutes(Number(e.target.value))
                                    }
                                  />
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                  <p className="text-sm text-yellow-800">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                    Hành khách sẽ nhận được thông báo qua email và SMS
                                  </p>
                                </div>
                                <Button className="w-full" onClick={handleDelayFlight}>
                                  Xác nhận báo chậm
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showCancelDialog} onOpenChange={(open: boolean) => {
                            if (!open) {
                              setShowCancelDialog(false);
                              setSelectedFlight(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  setSelectedFlight(flight);
                                  setShowCancelDialog(true);
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Hủy chuyến bay
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Hủy chuyến bay</DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc chắn muốn hủy chuyến bay {selectedFlight?.id ?? flight.id}?
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                  <p className="text-sm text-red-800">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                                    Hành động này sẽ:
                                  </p>
                                  <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                                    <li>Thông báo cho tất cả hành khách</li>
                                    <li>Cho phép hành khách đổi/hoàn vé</li>
                                    <li>Giải phóng tất cả ghế đã đặt</li>
                                  </ul>
                                </div>

                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => { setShowCancelDialog(false); setSelectedFlight(null); }}>
                                    Hủy
                                  </Button>
                                  <Button variant="destructive" className="flex-1" onClick={() => { handleCancelFlight(selectedFlight ?? flight); setShowCancelDialog(false); setSelectedFlight(null); }}>
                                    Xác nhận hủy
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {(flight.status === "DELAYED" ||
                        flight.status === "CANCELED") && (
                          <Button
                            variant="outline"
                            onClick={() => handleReactivateFlight(flight)}
                          >
                            Kích hoạt lại
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )
      }

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Trang {page + 1} / {totalPages || 1}</div>
        <div className="flex gap-2">
          <Button disabled={page <= 0 || loading} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</Button>
          <Button disabled={page >= (totalPages - 1) || loading} onClick={() => setPage(p => Math.min((totalPages - 1) || p + 1, p + 1))}>Next</Button>
        </div>
      </div>

      {/* Route Management Dialog */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo tuyến bay mới</DialogTitle>
            <DialogDescription>
              Thêm tuyến bay mới vào hệ thống
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Điểm đi</Label>
                <Input
                  id="origin"
                  value={newRoute.origin}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, origin: e.target.value })
                  }
                  placeholder="Nhập điểm đi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Điểm đến</Label>
                <Input
                  id="destination"
                  value={newRoute.destination}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, destination: e.target.value })
                  }
                  placeholder="Nhập điểm đến"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Loại tuyến bay</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!newRoute.external}
                    onChange={() =>
                      setNewRoute({ ...newRoute, external: false })
                    }
                    className="mr-2"
                  />
                  Nội địa
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newRoute.external}
                    onChange={() =>
                      setNewRoute({ ...newRoute, external: true })
                    }
                    className="mr-2"
                  />
                  Quốc tế
                </label>
              </div>
            </div>

            <Button className="w-full" onClick={handleCreateRoute}>
              Tạo tuyến bay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crew Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Phân công nhân viên cho chuyến bay {selectedFlightForAssign?.id}</DialogTitle>
            <DialogDescription>
              Chọn nhân viên để phân công cho chuyến bay này
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {loadingEmployees ? (
              <div className="text-center py-4">Đang tải danh sách nhân viên...</div>
            ) : (
              <div className="overflow-y-auto max-h-96 pr-2">
                <div className="grid grid-cols-2 gap-2">
                  {employees.map((employee) => (
                    <label key={employee.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 min-w-[200px]">
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployeeIds([...selectedEmployeeIds, employee.id]);
                          } else {
                            setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== employee.id));
                          }
                        }}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <div className="font-medium">{employee.fullName}</div>
                        <div className="text-sm text-gray-600">{employee.position} - {employee.totalFlightHours}/{employee.maxFlightHoursPerMonth} giờ</div>
                      </div>
                    </label>
                  ))}
                </div>
                {/* Employee Pagination */}
                {employeeTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Trang {employeePage + 1} / {employeeTotalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={employeePage <= 0 || loadingEmployees}
                        onClick={() => setEmployeePage(p => Math.max(0, p - 1))}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={employeePage >= (employeeTotalPages - 1) || loadingEmployees}
                        onClick={() => setEmployeePage(p => Math.min((employeeTotalPages - 1) || p + 1, p + 1))}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleAssignCrew} disabled={selectedEmployeeIds.length === 0}>
              Phân công ({selectedEmployeeIds.length} nhân viên)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


