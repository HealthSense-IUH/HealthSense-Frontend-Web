# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package.json package-lock.json* ./

# Cài đặt dependencies
RUN npm ci || npm install

# Copy toàn bộ source code
COPY . .

# Build ứng dụng Vite ra thư mục dist
RUN npm run build

# ==========================================
# Stage 2: Serve the app with Nginx
# ==========================================
FROM nginx:alpine

# Xóa các trang HTML mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy file build từ builder stage sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx (cho React Router DOM)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Phơi bày port 80
EXPOSE 80

# Chạy Nginx ở foreground
CMD ["nginx", "-g", "daemon off;"]
