# Restaurant Management System

Hệ thống quản lý nhà hàng với các tính năng quản lý đơn hàng, menu, nhân viên và báo cáo thống kê.

## Cấu Trúc Dự Án

Dự án được xây dựng theo mô hình monorepo sử dụng Turborepo:

```
restaurant_management/
├── apps/
│   ├── api/         # Backend API (NestJS)
│   └── web/         # Frontend (Next.js)
└── packages/        # Shared packages
```

## Yêu Cầu Hệ Thống

- Node.js (version 18.x trở lên)
- pnpm (version 8.x trở lên)
- MySQL (version 8.x)
- Redis

## Cài Đặt

1. Clone repository:

```bash
git clone [repository-url]
cd restaurant_management
```

2. Cài đặt dependencies:

```bash
pnpm install
```

3. Cấu hình môi trường:

### Backend (apps/api)

Tạo file `.env` trong thư mục `apps/api` với các biến môi trường sau:

```env
# Database Configuration
DATABASE_URL="mysql://[username]:[password]@[host]:[port]/[database_name]"

# Server Configuration
PORT=
SERVER_TIMEZONE=

# Redis Configuration
REDIS_PORT=
REDIS_HOST=
REDIS_DB_INDEX=

# Client Configuration
CLIENT_PUBLIC_URL=

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=
JWT_ACCESS_TOKEN_EXPIRES_IN=
JWT_REFRESH_TOKEN_EXPIRES_IN=
GUEST_JWT_ACCESS_TOKEN_EXPIRES_IN=
GUEST_JWT_REFRESH_TOKEN_EXPIRES_IN=

# Google OAuth Configuration
GOOGLE_REDIRECT_CLIENT_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_AUTHORIZED_REDIRECT_URI=

# Initial Admin Account
INITIAL_EMAIL_OWNER=
INITIAL_PASSWORD_OWNER=
```

### Frontend (apps/web)

Tạo file `.env` trong thư mục `apps/web` với các biến môi trường sau:

```env
# Server Configuration
PORT=

# API Configuration
NEXT_PUBLIC_API_ENDPOINT=
NEXT_PUBLIC_API_ENDPOINT_SOCKET=
NEXT_PUBLIC_URL=

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI=

# AWS Configuration
NEXT_PUBLIC_ACCESS_KEY_AWS=
NEXT_PUBLIC_SECRET_KEY_AWS=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

## Khởi Chạy Ứng Dụng

### Development Mode

1. Khởi chạy backend:

```bash
cd apps/api
pnpm dev
```

2. Khởi chạy frontend:

```bash
cd apps/web
pnpm dev
```

### Production Mode

1. Build ứng dụng:

```bash
pnpm build
```

2. Khởi chạy:

```bash
pnpm start
```

## Tính Năng Chính

- Quản lý đơn hàng và bàn
- Quản lý menu và danh mục
- Quản lý nhân viên và phân quyền
- Quản lý kho và nguyên liệu
- Báo cáo thống kê
- Tích hợp thanh toán
- Đăng nhập bằng Google OAuth
- Hỗ trợ đa ngôn ngữ (Việt-Anh)
- Quản lý hình ảnh với AWS S3

## Công Nghệ Sử Dụng

### Backend

- NestJS
- MySQL
- Redis
- JWT Authentication
- Google OAuth2

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React Query
- Socket.IO Client
- i18next

## Đóng Góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## License

[MIT License](LICENSE)

## Liên Hệ

phucnh.forwork@gmail.com
