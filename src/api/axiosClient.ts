import axios from 'axios';

const axiosClient = axios.create({
  // Port 8080 là mặc định của Java Spring Boot
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request: Tự động gắn Token vào header nếu đã đăng nhập
axiosClient.interceptors.request.use(async (config) => {
  // Lấy token từ localStorage (hoặc Redux store)
  //const user = JSON.parse(localStorage.getItem('user'));
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Interceptor Response: Làm sạch dữ liệu trả về
axiosClient.interceptors.response.use(
  (response) => {
    // Backend Java thường trả về dạng { status: 200, message: "OK", data: {...} }
    // Ta chỉ cần lấy phần data
    return response.data;
  },
  (error) => {
    // Xử lý lỗi chung (Ví dụ: Token hết hạn -> Tự logout)
    if (error.response?.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;