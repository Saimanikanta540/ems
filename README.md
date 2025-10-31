# EMS - Enterprise Management System

A full-stack web application built with Spring Boot (backend) and React/TypeScript (frontend) for content management and user authentication.

## 🏗️ Architecture

- **Backend**: Spring Boot 3.3, Java 21, MySQL, JPA/Hibernate, Flyway
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Database**: MySQL 8.0 with Flyway migrations
- **Deployment**: Docker & Docker Compose

## 🚀 Production Deployment

### Prerequisites

- Docker & Docker Compose
- MySQL 8.0 (or use the provided Docker setup)

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ems
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Health Check: http://localhost/health

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_USER=ems_user
MYSQL_PASSWORD=your_secure_password

# Application Configuration
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://mysql:3306/ems_prod
DB_USERNAME=ems_user
DB_PASSWORD=your_secure_password
```

### Manual Deployment

#### Backend Setup

1. **Database Setup**
   ```sql
   CREATE DATABASE ems_prod;
   CREATE USER 'ems_user'@'%' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON ems_prod.* TO 'ems_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Build and Run Backend**
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   java -jar target/*.war
   ```

#### Frontend Setup

1. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve with Nginx**
   ```bash
   # Copy dist/ contents to nginx html directory
   # Configure nginx with the provided nginx.conf
   ```

## 🔧 Configuration

### Backend Configuration

- **Port**: 8080 (configurable via `server.port`)
- **Database**: MySQL with connection pooling (HikariCP)
- **Security**: BCrypt password hashing, input validation
- **Migrations**: Flyway for database schema management

### Frontend Configuration

- **Port**: 80 (nginx)
- **API Proxy**: Automatically proxies `/api/*` to backend
- **Build**: Optimized production build with code splitting

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/{id}` - Get post by ID
- `GET /api/posts/slug/{slug}` - Get post by slug

### Comments
- `GET /api/comments` - Get all comments
- `GET /api/comments/post/{postId}` - Get comments for a post
- `POST /api/comments` - Create a comment

## 🗄️ Database Schema

The application uses Flyway for database migrations. Schema includes:

- `users` - User accounts
- `posts` - Blog posts/articles
- `comments` - Post comments
- `post_tags` - Post tags (many-to-many)

## 🔒 Security Features

- Password hashing with BCrypt
- Input validation and sanitization
- CORS configuration
- Error message sanitization in production
- No sensitive data exposure

## 📈 Monitoring

- Health check endpoints: `/actuator/health`
- Application metrics: `/actuator/metrics`
- Application info: `/actuator/info`

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up -d --build backend
```

## 🔧 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Database | H2 (file-based) | MySQL |
| Logging | DEBUG | INFO/WARN |
| Swagger | Enabled | Disabled |
| Error Details | Full | Sanitized |
| Connection Pool | Basic | Optimized |

## 🚀 Performance Optimizations

- Database connection pooling
- JPA query optimization
- Static asset caching
- Gzip compression
- Docker multi-stage builds

## 📝 License

[Add your license here]
