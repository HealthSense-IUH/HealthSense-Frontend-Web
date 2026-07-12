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
- `src/`: Mã nguồn chính của ứng dụng.
- `public/`: Tài nguyên tĩnh (hình ảnh, favicon, ...).
- `index.html`: File HTML gốc.
- `vite.config.ts`: Cấu hình Vite.
- `tsconfig.json`: Cấu hình TypeScript.

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
- `src/`: Main application source code.
- `public/`: Static assets (images, favicon, ...).
- `index.html`: Root HTML file.
- `vite.config.ts`: Vite configuration.
- `tsconfig.json`: TypeScript configuration.

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
