# HealthSense Frontend Web

## Tiếng Việt

**HealthSense Frontend Web** là ứng dụng Web của hệ sinh thái theo dõi sức khỏe tim mạch và tầm soát rung nhĩ (AFib) HealthSense, phục vụ đầy đủ 4 vai trò (**Người dùng / Member**, **Bác sĩ / Doctor**, **Quản trị viên / Admin**, **Quản trị viên cấp cao / Super Admin**), được xây dựng bằng **React 19**, **TypeScript**, **Vite 8** và **Tailwind CSS 4**.

### Chức năng chính
- **Tổng quan sức khỏe & Tầm soát AFib:** Tải file PPG `.csv` trực tiếp lên hệ thống, theo dõi lịch heatmap theo ngày, xem chi tiết sóng mạch PPG, đồ thị Poincaré, chỉ số SQI, phân tích 5 cửa sổ 30 giây (Global Rule V2), bảng 8 chỉ số HRV và **In / Xuất báo cáo tầm soát AFib 1 trang chuẩn A4 (PDF)**.
- **Thống kê & Xu hướng:** Biểu đồ xu hướng nhịp tim 14 ngày, phân bố kết luận AI, khung giờ đo, thống kê lượt tư vấn và thanh toán cho Member, Doctor và Admin.
- **Tư vấn bác sĩ trực tuyến:** Đăng ký vào hàng đợi tư vấn, xác nhận điều phối bác sĩ, nhắn tin thời gian thực qua WebSocket/STOMP, chia sẻ hồ sơ sức khỏe có kiểm soát, lập và tra cứu tổng kết y khoa.
- **Ví lượt tư vấn & Thanh toán PayOS:** Xem số dư, lịch sử sổ cái giao dịch và mua gói lượt trực tuyến qua PayOS.
- **Ăn uống & Dinh dưỡng tim mạch:** Tra cứu 629 thực phẩm (Việt Nam + USDA) kèm hình ảnh và đánh giá màu theo đơn ăn uống cá nhân hóa của bác sĩ; **AI Ước tính calo & natri** từ ảnh món ăn hoặc mô tả văn bản; **Nhật ký ăn uống hôm nay** theo dõi giới hạn 2.000 mg Natri của AHA.
- **Trợ lý AI Cara:** Hội thoại streaming SSE có Tool Calling theo quyền, hỗ trợ đa ngôn ngữ **Tiếng Việt / Tiếng Anh (i18next)**.

### Công nghệ
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling & UI:** Tailwind CSS 4, Radix UI / shadcn/ui, Recharts
- **State & Data:** Zustand, TanStack Query (React Query), Axios
- **Realtime & i18n:** STOMP over WebSocket, i18next (`vi` / `en`)
- **Routing & Quality:** React Router DOM 7, ESLint

### Cấu trúc dự án chính
- `src/app/`: Provider cấp ứng dụng và cấu hình i18n/QueryClient.
- `src/router/`: Định nghĩa tuyến đường theo vai trò (public, member, doctor, admin).
- `src/pages/public/`: Trang giới thiệu, đăng nhập, đăng ký, quên mật khẩu.
- `src/pages/app/general/`: Dashboard, lịch sử đo AFib & xuất PDF, dinh dưỡng & ước tính calo AI, tư vấn, trợ lý Cara, ví lượt.
- `src/pages/app/doctor/`: Hàng đợi tiếp nhận, không gian tư vấn, kê đơn dinh dưỡng và thống kê bệnh nhân.
- `src/pages/app/management/`: Quản trị người dùng, hồ sơ sức khỏe, quy tắc dinh dưỡng, gói lượt và đơn thanh toán.
- `src/services/`, `src/stores/`, `src/types/`, `src/locales/{vi,en}/`: API client, Zustand stores, TypeScript types và tài nguyên song ngữ.

### Cài đặt và Sử dụng
```bash
npm install
npm run dev      # Chạy server phát triển (mặc định gọi http://localhost:8080, ghi đè qua VITE_API_BASE_URL)
npm run build    # Kiểm tra TypeScript (tsc -b) & build production
npm run lint     # Kiểm tra ESLint
```

---

## English

**HealthSense Frontend Web** is the web application for the HealthSense cardiovascular monitoring and atrial fibrillation (AFib) screening platform, serving **Members**, **Doctors**, **Admins**, and **Super Admins**. Built with **React 19**, **TypeScript**, **Vite 8**, and **Tailwind CSS 4**.

### Key Features
- **Health Dashboard & AFib Screening:** Direct PPG `.csv` upload, daily measurement heatmap, PPG waveform & Poincaré plots, SQI quality badge, 5-window Global Rule V2 analysis, 8-metric HRV table, and **1-page A4 Medical Report Print / PDF Export**.
- **Analytics & Trends:** 14-day heart rate trends, AI screening distribution, consultation & payment analytics across Member, Doctor, and Admin views.
- **Real-Time Teleconsultation:** Queue registration, doctor dispatch confirmation, WebSocket/STOMP chat, authorized health-record sharing, and finalized medical summaries.
- **Credit Wallet & PayOS Payments:** Balance tracking, ledger history, and PayOS checkout.
- **Cardiovascular Nutrition:** 629 curated reference foods (VN_FCT + USDA) with personalized doctor diet-prescription scoring, **AI Meal Photo & Text Calorie Estimator**, and **Today's Food Log** tracking the 2,000 mg AHA daily sodium limit.
- **Cara AI Assistant:** Role-scoped SSE streaming assistant with full **Vietnamese / English** localization.

### Setup & Scripts
```bash
npm install
npm run dev
npm run build
npm run lint
```
