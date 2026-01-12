import * as XLSX from "xlsx";
import type { Flight } from "../types/flightType";


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
            'Số chuyến bay': employee.assignments?.length || 0,
            'Giờ bay trong tháng': `${employee.monthlyHours} / ${employee.maxHours}`,
            'Kinh nghiệm': employee.workExperience || '—',
            'Tổng giờ bay': employee.totalFlightHours || 0,
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
        DELAYED: "Chậm",
        CANCLED: "Đã hủy",
        COMPLETED: "Hoàn thành",
        DEPARTED: "Khởi hành",
        ACTIVE: "Hoạt động",
        MAINTENANCE: "Bảo trì",
        INACTIVE: "Ngừng hoạt động",
    };
    return statusLabels[String(status ?? '')] || String(status ?? '');
};