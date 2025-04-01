# Restaurant Management System

A comprehensive restaurant management system with features for order management, menu management, staff management, and reporting.

## Project Structure

The project is built as a monorepo using Turborepo:

```
restaurant_management/
├── apps/
│   ├── api/         # Backend API (NestJS)
│   └── web/         # Frontend (Next.js)
├── docker/
│   ├── Dockerfile.api
│   └── Dockerfile.web
├── docker-compose.yml
└── .env
```

## System Requirements

- Node.js (version 18.x or higher)
- pnpm (version 8.x or higher)
- MySQL (version 8.x)
- Redis

## Installation

1. Clone repository:

```bash
git clone [repository-url]
cd restaurant_management
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment:

### Backend (apps/api)

Create `.env` file in `apps/api` directory with the following environment variables:

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

Create `.env` file in `apps/web` directory with the following environment variables:

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

## Running the Application

### Development Mode

1. Start backend:

```bash
cd apps/api
pnpm dev
```

2. Start frontend:

```bash
cd apps/web
pnpm dev
```

### Production Mode

1. Build application:

```bash
pnpm build
```

2. Start:

```bash
pnpm start
```

## Main Features

- Order and table management
- Menu and category management
- Staff and role management
- Inventory and ingredient management
- Reporting and analytics
- Payment integration
- Google OAuth login
- Multi-language support (Vietnamese-English)
- Image management with AWS S3

## Technologies Used

### Backend

- NestJS
- TypeORM
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

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

Email: phucnh.forwork@gmail.com
Phone: 0866866923
