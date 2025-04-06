# Restaurant Management System

A comprehensive restaurant management system with features for order management, menu management, staff management, and reporting.

## Project Structure

The project is built as a monorepo using Turborepo and pnpm workspaces:

```
restaurant_management/
├── apps/
│   ├── api/         # Backend API (NestJS)
│   └── web/         # Frontend (Next.js)
├── packages/
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/           # Shared UI components
├── pnpm-workspace.yaml
└── package.json
```

## System Requirements

- Node.js (version 20.x recommended)
- pnpm (version 8.15.6 or higher)
- MySQL (version 8.x)
- Redis
- Docker (optional, for containerized deployment)

## Installation

1. Clone repository:

```bash
git clone https://github.com/ngphuc2808/restaurant_management.git
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
PORT=3001
SERVER_TIMEZONE=Asia/Ho_Chi_Minh

# Redis Configuration
REDIS_PORT=6379
REDIS_HOST=localhost
REDIS_DB_INDEX=0

# Client Configuration
CLIENT_PUBLIC_URL=http://localhost:3000

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
GUEST_JWT_ACCESS_TOKEN_EXPIRES_IN=30m
GUEST_JWT_REFRESH_TOKEN_EXPIRES_IN=1d

# Google OAuth Configuration (if using Google OAuth)
GOOGLE_REDIRECT_CLIENT_URL=http://localhost:3000/oauth/google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_AUTHORIZED_REDIRECT_URI=http://localhost:3001/api-server/v1/auth/google/callback

# Initial Admin Account
INITIAL_EMAIL_OWNER=admin@example.com
INITIAL_PASSWORD_OWNER=StrongPassword123
```

### Frontend (apps/web)

Create `.env` file in `apps/web` directory with the following environment variables:

```env
# Server Configuration
PORT=3000

# API Configuration
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3001/api-server/v1
NEXT_PUBLIC_API_ENDPOINT_SOCKET=http://localhost:3001
NEXT_PUBLIC_URL=http://localhost:3000

# Google OAuth Configuration (if using Google OAuth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI=http://localhost:3001/api-server/v1/auth/google/callback

# AWS S3 Configuration (for image uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

## Database Setup

1. Run Prisma migrations to set up the database:

```bash
cd apps/api
pnpm prisma migrate deploy
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

Alternatively, run both simultaneously from the root:

```bash
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

## Docker Deployment

The project includes Dockerfiles for containerized deployment:

```bash
# Build and run using Docker Compose
docker-compose up -d
```

## Main Features

- **Management Dashboard**: View sales metrics and restaurant performance
- **Order Management**: Process guest orders in real-time
- **Table Management**: Configure and track restaurant tables with QR code ordering
- **Menu Management**: Create and update dishes with availability status
- **User Management**: Manage staff accounts with role-based access control
- **Guest Experience**: Self-service ordering via QR codes
- **Real-time Updates**: Socket.IO integration for instant status updates
- **Multi-language Support**: Vietnamese and English localizations
- **Authentication**: JWT-based authentication with role-based permissions
- **Google OAuth**: Optional Google Sign-In integration
- **Image Management**: AWS S3 integration for dish images

## Technologies Used

### Backend

- NestJS framework
- Prisma ORM
- MySQL database
- Redis for caching
- Socket.IO for real-time communication
- JWT authentication
- i18n for internationalization
- Google OAuth2 (optional)

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS with shadcn/ui components
- Tanstack React Query for data fetching
- Socket.IO Client for real-time updates
- next-intl for internationalization
- Zod for schema validation
- AWS S3 for image storage

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

- Developer: Nguyen Hoang Phuc
- Email: phucnh.forwork@gmail.com
- Phone: 0866866923
