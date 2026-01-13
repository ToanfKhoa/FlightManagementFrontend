import * as XLSX from "xlsx";
import type { Flight } from "../types/flightType";
import type {
    TicketStatusStatistic,
    FlightPassengerStatistic,
    FlightLoadFactorStatistic,
    FlightAvailableSeatsStatistic,
    CrewFlightHoursStatistic,
    CrewPerFlightStatistic,
    AircraftStatusStatistic
} from "../types/statisticType";
import { formatCurrency } from "../lib/mockData";


export const exportFlightsToExcel = (flights: Flight[]) => {
    try {
        // Prepare data for export
        const exportData = flights.map(flight => ({
            'Mã chuyến bay': flight.id,
            'Tuyến bay': flight.route ? `${flight.route.origin} → ${flight.route.destination}` : '—',
            'Máy bay': flight.aircraft?.type || '—',
            'Mã số máy bay': flight.aircraft?.registrationNumber || '—',
            'Trạng thái': getStatusLabel(flight.status),
            'Thời gian khởi hành': flight.departureTimeDisplay || '—',
            'Thời gian hạ cánh': flight.arrivalTimeDisplay || '—',
            'Số chỗ trống': flight.aircraft?.seatCapacity || '—',
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách chuyến bay');

        // Generate filename with Vietnam timestamp
        const timestamp = new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/[\/\s:]/g, '-');

        const filename = `danh-sach-chuyen-bay-${timestamp}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

        return true;
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        return false;
    }
};


export const exportCrewToExcel = (employees: any[]) => {
    try {
        // Prepare data for export
        const exportData = employees.map(employee => ({
            'ID': employee.id,
            'Họ tên': employee.fullName,
            'Vị trí': getPositionLabel(employee.position),
            'Giờ bay trong tháng / Tối đa': `${employee.totalFlightHours} / ${employee.maxFlightHoursPerMonth}`,
            'Kinh nghiệm': employee.workExperience || '—'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách phi hành đoàn');

        // Generate filename with Vietnam timestamp
        const timestamp = new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/[\/\s:]/g, '-');

        const filename = `danh-sach-phi-hanh-doan-${timestamp}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

        return true;
    } catch (error) {
        console.error("Error exporting crew to Excel:", error);
        return false;
    }
};

/**
 * Export aircraft data to Excel file
 * @param aircrafts Array of aircrafts to export
 */
export const exportAircraftToExcel = (aircrafts: any[]) => {
    try {
        // Prepare data for export
        const exportData = aircrafts.map(aircraft => ({
            'ID': aircraft.id,
            'Số đăng ký': aircraft.registrationNumber,
            'Loại máy bay': aircraft.type,
            'Nhà sản xuất': aircraft.manufacturer,
            'Model': aircraft.model,
            'Năm sản xuất': aircraft.manufactureYear,
            'Số serial': aircraft.serialNumber,
            'Sức chứa ghế': aircraft.seatCapacity,
            'Trạng thái': getStatusLabel(aircraft.status),
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách máy bay');

        // Generate filename with Vietnam timestamp
        const timestamp = new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/[\/\s:]/g, '-');

        const filename = `danh-sach-may-bay-${timestamp}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

        return true;
    } catch (error) {
        console.error("Error exporting aircraft to Excel:", error);
        return false;
    }
};

/**
 * Get position label in Vietnamese
 * @param position Employee position
 * @returns Vietnamese position label
 */
const getPositionLabel = (position: string) => {
    const positionLabels: Record<string, string> = {
        PILOT: "Phi công",
        COPILOT: "Cơ phó",
        ATTENDANT: "Tiếp viên",
        OPERATOR: "Nhân viên điều hành",
        TICKETING: "Nhân viên vé",
        OTHER: "Khác",
    };
    return positionLabels[position] || position;
};

/**
 * Get status label in Vietnamese
 * @param status Flight or aircraft status
 * @returns Vietnamese status label
 */
const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
        OPEN: "Đang mở",
        FULL: "Hết chỗ",
        DELAYED: "Hoãn",
        CANCLED: "Đã hủy",
        COMPLETED: "Hoàn thành",
        DEPARTED: "Khởi hành",
        ACTIVE: "Hoạt động",
        MAINTENANCE: "Bảo trì",
        INACTIVE: "Ngừng hoạt động",
    };
    return statusLabels[String(status ?? '')] || String(status ?? '');
};

export const exportStatisticsToExcel = (stats: {
    ticketStatusStats: TicketStatusStatistic | null;
    flightPassengerStats: FlightPassengerStatistic[] | null;
    loadFactorStats: FlightLoadFactorStatistic[] | null;
    availableSeatsStats: FlightAvailableSeatsStatistic[] | null;
    crewHoursStats: CrewFlightHoursStatistic[] | null;
    crewPerFlightStats: CrewPerFlightStatistic[] | null;
    aircraftStatusStats: AircraftStatusStatistic | null;
    totalRevenue: number;
    totalBookings: number;
    paidBookings: number;
    canceledBookings: number;
    economyBookings: number;
    businessBookings: number;
    firstBookings: number;
    activeFlights: number;
    delayedFlights: number;
    canceledFlights: number;
    activeAircraft: number;
    maintenanceAircraft: number;
    pilots: number;
    attendants: number;
}) => {
    try {
        const workbook = XLSX.utils.book_new();

        // Ticket Status
        if (stats.ticketStatusStats) {
            const ticketData = [{
                'Đã hủy': stats.ticketStatusStats.canceledCount,
                'Đã đổi': stats.ticketStatusStats.changedCount,
                'Đã hoàn tiền': stats.ticketStatusStats.refundedCount,
                'Tổng vé ảnh hưởng': stats.ticketStatusStats.totalAffectedTickets,
            }];
            const ws = XLSX.utils.json_to_sheet(ticketData);
            XLSX.utils.book_append_sheet(workbook, ws, 'Trạng thái vé');
        }

        // Aircraft Status
        if (stats.aircraftStatusStats) {
            const aircraftData = [{
                'Hoạt động': stats.aircraftStatusStats.activeCount,
                'Bảo trì': stats.aircraftStatusStats.maintenanceCount,
                'Không hoạt động': stats.aircraftStatusStats.inactiveCount,
                'Tổng số': stats.aircraftStatusStats.totalAircraftCount,
            }];
            const ws = XLSX.utils.json_to_sheet(aircraftData);
            XLSX.utils.book_append_sheet(workbook, ws, 'Trạng thái máy bay');
        }

        // Flight Passengers
        if (stats.flightPassengerStats) {
            const passengerData = stats.flightPassengerStats.map(stat => ({
                'ID chuyến bay': stat.flightId,
                'Điểm khởi hành': stat.origin,
                'Điểm đến': stat.destination,
                'Thời gian khởi hành': new Date(stat.departureTime).toLocaleString('vi-VN'),
                'Trạng thái': getStatusLabel(stat.flightStatus),
                'Số hành khách': stat.passengerCount,
            }));
            const ws = XLSX.utils.json_to_sheet(passengerData);
            XLSX.utils.book_append_sheet(workbook, ws, 'Hành khách theo chuyến bay');
        }

        // Load Factor
        if (stats.loadFactorStats) {
            const loadData = stats.loadFactorStats.map(stat => ({
                'ID chuyến bay': stat.flightId,
                'Điểm khởi hành': stat.origin,
                'Điểm đến': stat.destination,
                'Thời gian khởi hành': new Date(stat.departureTime).toLocaleString('vi-VN'),
                'Trạng thái': getStatusLabel(stat.flightStatus),
                'Ghế đã bán': stat.soldSeatsCount,
                'Tổng ghế': stat.totalSeatCapacity,
                'Tỷ lệ lấp đầy (%)': stat.loadFactorPercentage,
            }));
            const ws = XLSX.utils.json_to_sheet(loadData);
            XLSX.utils.book_append_sheet(workbook, ws, 'Tỷ lệ lấp đầy');
        }

        // Available Seats
        if (stats.availableSeatsStats) {
            const seatsData = stats.availableSeatsStats.map(stat => ({
                'ID chuyến bay': stat.flightId,
                'Điểm khởi hành': stat.origin,
                'Điểm đến': stat.destination,
                'Thời gian khởi hành': new Date(stat.departureTime).toLocaleString('vi-VN'),
                'Thời gian hạ cánh': new Date(stat.arrivalTime).toLocaleString('vi-VN'),
                'Mã máy bay': stat.aircraftRegistrationNumber,
                'Trạng thái': getStatusLabel(stat.flightStatus),
                'Ghế trống': stat.availableSeatsCount,
                'Tổng ghế': stat.totalSeatCapacity,
            }));
            const ws = XLSX.utils.json_to_sheet(seatsData);
            XLSX.utils.book_append_sheet(workbook, ws, 'Ghế khả dụng');
        }

        // Crew Hours
        if (stats.crewHoursStats && stats.crewHoursStats.length > 0) {
            const hoursData = stats.crewHoursStats.map(stat => ({
                'ID chuyến bay': stat.flightId,
                'Điểm khởi hành': stat.origin,
                'Điểm đến': stat.destination,
                'Thời gian khởi hành': new Date(stat.departureTime).toLocaleString('vi-VN'),
                'Thời gian hạ cánh': new Date(stat.arrivalTime).toLocaleString('vi-VN'),
                'Mã máy bay': stat.aircraftRegistrationNumber,
                'Trạng thái': getStatusLabel(stat.flightStatus),
                'Ghế trống': stat.availableSeatsCount,
                'Tổng ghế': stat.totalSeatCapacity,
            }));
            const ws = XLSX.utils.json_to_sheet(hoursData);
            XLSX.utils.book_append_sheet(workbook, ws, 'Giờ bay phi hành đoàn');
        }

        // Crew Per Flight
        if (stats.crewPerFlightStats) {
            const crewData = stats.crewPerFlightStats.map(stat => ({
                'ID chuyến bay': stat.flightId,
                'Điểm khởi hành': stat.origin,
                'Điểm đến': stat.destination,
                'Thời gian khởi hành': new Date(stat.departureTime).toLocaleString('vi-VN'),
                'Trạng thái': getStatusLabel(stat.flightStatus),
                'Tổng phi hành đoàn': stat.totalCrewCount,
                'Phi công': stat.pilotCount,
                'Phó phi công': stat.copilotCount,
                'Tiếp viên': stat.attendantCount,
            }));
            const ws = XLSX.utils.json_to_sheet(crewData);
            XLSX.utils.book_append_sheet(workbook, ws, 'Phi hành đoàn theo chuyến');
        }

        // Revenue Summary
        const revenueData = [{
            'Tổng doanh thu': formatCurrency(stats.totalRevenue),
            'Tổng số vé': stats.totalBookings,
            'Vé đã thanh toán': stats.paidBookings,
            'Vé đã hủy': stats.canceledBookings,
            'Vé phổ thông': stats.economyBookings,
            'Vé thương gia': stats.businessBookings,
            'Vé hạng nhất': stats.firstBookings,
        }];
        const wsRevenue = XLSX.utils.json_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(workbook, wsRevenue, 'Tóm tắt doanh thu');

        // Operations Summary
        const operationsData = [{
            'Chuyến bay hoạt động': stats.activeFlights,
            'Chuyến bay chậm': stats.delayedFlights,
            'Chuyến bay hủy': stats.canceledFlights,
        }];
        const wsOperations = XLSX.utils.json_to_sheet(operationsData);
        XLSX.utils.book_append_sheet(workbook, wsOperations, 'Tóm tắt điều hành');

        // Resources Summary
        const resourcesData = [{
            'Máy bay hoạt động': stats.activeAircraft,
            'Máy bay bảo trì': stats.maintenanceAircraft,
            'Phi công': stats.pilots,
            'Tiếp viên': stats.attendants,
        }];
        const wsResources = XLSX.utils.json_to_sheet(resourcesData);
        XLSX.utils.book_append_sheet(workbook, wsResources, 'Tóm tắt nguồn lực');

        // Generate filename
        const timestamp = new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/[\/\s:]/g, '-');
        const filename = `thong-ke-${timestamp}.xlsx`;

        // Export
        XLSX.writeFile(workbook, filename);
        return true;
    } catch (error) {
        console.error("Error exporting statistics to Excel:", error);
        return false;
    }
};