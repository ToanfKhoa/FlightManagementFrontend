import axios from 'axios';

const axiosClient = axios.create({
  // Port server 8080
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response
axiosClient.interceptors.response.use(
  (response) => {
    // response { status: 200, message: "OK", data: {...} }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Lỗi Unauthorized và chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Dùng instance 'axios' gốc, KHÔNG dùng 'axiosClient' để tránh lặp interceptor
        const result = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken: refreshToken
        });
        const { accessToken, refreshToken: newRefreshToken } = result.data.data; // .data.data vì axios bọc 1 lớp, backend bọc 1 lớp

        localStorage.setItem('access_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Gắn token mới vào request bị lỗi lúc nãy
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        console.error("Session expired:", refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;