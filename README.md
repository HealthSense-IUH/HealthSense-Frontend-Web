# HealthSense Frontend Web

## Tiếng Việt

**HealthSense Frontend Web** là giao diện người dùng (web application) cho hệ thống theo dõi sức khỏe HealthSense, được phát triển bằng React + TypeScript.

### Chức năng chính
- Hiển thị dữ liệu nhịp tim (BPM) và nồng độ oxy trong máu (SpO2) theo thời gian thực.
- Trực quan hóa các chỉ số biến thiên nhịp tim (HRV) bằng biểu đồ.
- Hiển thị kết quả dự đoán trạng thái sức khỏe từ AI Service.
- Giao diện responsive, hỗ trợ cả desktop và mobile.

### Công nghệ
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **Animation:** Framer Motion
- **Routing:** React Router DOM 7
- **Icons:** Lucide React, React Icons
- **Linting:** ESLint + Prettier

### Cấu trúc dự án
- `src/App.tsx`: Root component của ứng dụng.
- `src/app/`: Provider cấp ứng dụng.
- `src/router/`: Khai báo route React Router.
- `src/pages/public-routes-page/`: Page public như landing, login, register.
- `src/pages/app-routes-page/`: Page yêu cầu đăng nhập như dashboard, management.
- `src/pages/commons/`: Route guard và helper dùng chung cho route.
- `src/features/`: State/domain logic như auth store.
- `src/services/`: API module theo domain.
- `src/types/`: DTO/type theo domain.
- `src/types/base/`: Kiểu response dùng chung như `ApiResponse<T>`, `PageResponse<T>`.
- `src/components/ui/`: Component shadcn/ui.
- `src/components/layout/`: Layout dùng chung.
- Xem thêm quy ước chi tiết trong `ARCHITECTURE.md`.

### Auth API
- Backend mặc định: `http://localhost:8080` (`VITE_API_BASE_URL` để override).
- Web frontend dùng `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/register`, `GET /api/auth/me`.
- Axios đã bật `withCredentials` và tự refresh access token một lần khi private API trả `401`.

### Cài đặt và Sử dụng
1. Cài đặt thư viện:
   ```bash
   npm install
   ```
2. Chạy server phát triển:
   ```bash
   npm run dev
   ```
3. Build production:
   ```bash
   npm run build
   ```
4. Xem trước bản build:
   ```bash
   npm run preview
   ```

---

## English

**HealthSense Frontend Web** is the user interface (web application) for the HealthSense health monitoring system, built with React + TypeScript.

### Key Features
- Displays real-time heart rate (BPM) and blood oxygen saturation (SpO2) data.
- Visualizes Heart Rate Variability (HRV) metrics through interactive charts.
- Shows health status predictions from the AI Service.
- Responsive design supporting both desktop and mobile devices.

### Tech Stack
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **Animation:** Framer Motion
- **Routing:** React Router DOM 7
- **Icons:** Lucide React, React Icons
- **Linting:** ESLint + Prettier

### Project Structure
- `src/App.tsx`: Root application component.
- `src/app/`: App-level providers.
- `src/router/`: React Router route declarations.
- `src/pages/public-routes-page/`: Public pages such as landing, login, and register.
- `src/pages/app-routes-page/`: Authenticated pages such as dashboard and management.
- `src/pages/commons/`: Route guards and route-level shared helpers.
- `src/features/`: State/domain logic such as the auth store.
- `src/services/`: API modules grouped by domain.
- `src/types/`: DTOs and types grouped by domain.
- `src/types/base/`: Shared response contracts such as `ApiResponse<T>` and `PageResponse<T>`.
- `src/components/ui/`: shadcn/ui components.
- `src/components/layout/`: Shared layouts.
- See `ARCHITECTURE.md` for detailed placement rules.

### Auth API
- Default backend: `http://localhost:8080`; override with `VITE_API_BASE_URL`.
- Web frontend uses `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/register`, and `GET /api/auth/me`.
- Axios uses `withCredentials` and refreshes the access token once when a private API returns `401`.

### Installation and Usage
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview production build:
   ```bash
   npm run preview
   ```
