# SubSentry Backend API

Spring Boot REST API for the SubSentry subscription management application.

## 🏗️ Architecture

### Technology Stack

- **Spring Boot 3.x** - Main application framework
- **Spring Security** - Authentication and authorization
- **Spring Data MongoDB** - Data persistence layer
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Token authentication
- **Spring Mail** - Email service integration
- **Spring Scheduler** - Background task scheduling

### Project Structure

```
src/main/java/com/subsentry/
├── SubSentryApplication.java          # Main application class
├── config/                            # Configuration classes
│   ├── SecurityConfig.java           # Security configuration
│   ├── MongoConfig.java              # MongoDB configuration
│   └── WebConfig.java                # Web configuration
├── controller/                        # REST controllers
│   ├── AuthController.java           # Authentication endpoints
│   ├── SubscriptionController.java   # Subscription management
│   ├── AnalyticsController.java      # Analytics endpoints
│   ├── ReportController.java         # Report generation
│   ├── NotificationController.java   # Notification management
│   └── SettingsController.java       # User settings
├── service/                          # Business logic layer
│   ├── AuthService.java              # Authentication service
│   ├── SubscriptionService.java      # Subscription business logic
│   ├── AnalyticsService.java         # Analytics calculations
│   ├── ReportService.java            # Report generation
│   ├── NotificationService.java      # Notification handling
│   └── EmailService.java             # Email notifications
├── repository/                       # Data access layer
│   ├── UserRepository.java           # User data access
│   ├── SubscriptionRepository.java   # Subscription data access
│   ├── NotificationRepository.java   # Notification data access
│   └── ReportRepository.java         # Report data access
├── model/                           # Data models
│   ├── User.java                    # User entity
│   ├── Subscription.java            # Subscription entity
│   ├── Notification.java            # Notification entity
│   ├── Report.java                  # Report entity
│   └── dto/                         # Data transfer objects
└── security/                        # Security components
    ├── JwtUtil.java                 # JWT utilities
    ├── JwtAuthenticationFilter.java # JWT filter
    └── UserDetailsServiceImpl.java  # User details service
```

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Python 3.8+ (for report generation)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd subsentry/backend
   ```

2. **Install dependencies**

   ```bash
   mvn clean install
   ```

3. **Setup Python environment for report generation**

   ```bash
   cd scripts
   # On macOS/Linux:
   ./setup_python_env.sh
   # On Windows:
   setup_python_env.bat
   ```

   This creates a virtual environment and installs required Python packages (pandas, matplotlib, mysql-connector-python, reportlab).

   **Important:** After setup, configure Java to use the venv Python:
   
   ```bash
   # Option 1: Set environment variable (recommended)
   export PYTHON_CMD=./scripts/venv/bin/python  # macOS/Linux
   # or
   set PYTHON_CMD=scripts\venv\Scripts\python.exe  # Windows
   
   # Option 2: Update application.properties
   reports.python.command=./scripts/venv/bin/python
   ```

4. **Configure application**
   Update `application.properties` with your database credentials:

   ```properties
   # Server Configuration
   server.port=8080

   # Database Configuration
   spring.datasource.url=jdbc:mysql://127.0.0.1:3306/subsentry
   spring.datasource.username=root
   spring.datasource.password=password

   # JWT Configuration
   jwt.secret=your-secret-key
   jwt.expiration=86400000

   # Python Report Configuration (optional)
   reports.python.enabled=true
   reports.python.command=${PYTHON_CMD:python3}
   reports.python.script=scripts/report_generator.py
   ```

5. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/signup

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "defaultCurrency": "USD"
}
```

#### POST /api/auth/login

Authenticate user and return JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/forgot-password

Send password reset email.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

### Subscription Endpoints

#### GET /api/subscriptions

Get all subscriptions for the authenticated user.

**Query Parameters:**

- `page` - Page number (default: 0)
- `size` - Page size (default: 20)
- `category` - Filter by category
- `status` - Filter by status

#### POST /api/subscriptions

Create a new subscription.

**Request Body:**

```json
{
  "name": "Netflix",
  "amount": 15.99,
  "category": "Streaming",
  "billingCycle": "monthly",
  "startDate": "2024-01-01T00:00:00Z",
  "autoRenewal": true,
  "notes": "Premium plan"
}
```

#### PUT /api/subscriptions/{id}

Update an existing subscription.

#### DELETE /api/subscriptions/{id}

Delete a subscription.

### Analytics Endpoints

#### GET /api/analytics/overview

Get spending overview and key metrics.

#### GET /api/analytics/spending-trend

Get spending trends over time.

**Query Parameters:**

- `dateRange` - Time range (1month, 3months, 6months, 1year, all)
- `category` - Filter by category

#### GET /api/analytics/category-breakdown

Get spending breakdown by category.

### Report Endpoints

#### POST /api/reports/generate

Generate a new report.

**Request Body:**

```json
{
  "name": "Monthly Summary",
  "type": "summary",
  "dateRange": "lastMonth",
  "format": "pdf",
  "includeCharts": true,
  "includeInsights": true
}
```

#### GET /api/reports/{id}/download

Download a generated report.

### Notification Endpoints

#### GET /api/notifications

Get user notifications.

#### PUT /api/notifications/{id}/read

Mark notification as read.

#### PUT /api/notifications/read-all

Mark all notifications as read.

## 🔒 Security

### JWT Authentication

- All endpoints (except auth) require valid JWT token
- Token expiration: 24 hours
- Refresh token mechanism for long-term sessions

### Password Security

- BCrypt hashing with salt
- Password strength validation
- Secure password reset flow

### Data Validation

- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📊 Database Schema

### User Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String",
  "defaultCurrency": "String",
  "timezone": "String",
  "createdAt": "Date",
  "updatedAt": "Date",
  "emailVerified": "Boolean"
}
```

### Subscription Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "name": "String",
  "amount": "Number",
  "category": "String",
  "billingCycle": "String",
  "startDate": "Date",
  "nextRenewalDate": "Date",
  "autoRenewal": "Boolean",
  "notes": "String",
  "paymentMethod": "String",
  "portalLink": "String",
  "status": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Notification Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "type": "String",
  "title": "String",
  "message": "String",
  "read": "Boolean",
  "createdAt": "Date"
}
```

## 🔄 Background Services

### Subscription Renewal Checker

- Runs daily at 2 AM
- Checks for subscriptions renewing in next 2 days
- Sends email and in-app notifications
- Updates subscription status

### Report Scheduler

- Processes scheduled report requests
- Generates reports in background
- Sends email notifications when complete

### Data Cleanup

- Removes expired notifications
- Archives old reports
- Cleans up temporary files

## 🧪 Testing

### Unit Tests

```bash
mvn test
```

### Integration Tests

```bash
mvn verify
```

### API Testing

Use Postman collection or curl commands to test endpoints.

## 📈 Monitoring

### Health Checks

- Spring Boot Actuator endpoints
- Database connectivity checks
- External service health monitoring

### Logging

- Structured logging with Logback
- Log levels configurable per environment
- Error tracking and alerting

### Metrics

- Application performance metrics
- Business metrics (user signups, subscriptions created)
- System metrics (CPU, memory, disk usage)

## 🚀 Deployment

### Docker

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/subsentry-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Environment Variables

```env
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/subsentry
JWT_SECRET=your-secret-key
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-password
```

### Production Configuration

- Enable HTTPS
- Configure proper CORS settings
- Set up monitoring and alerting
- Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

# SubSentry Project Setup

## Database Setup

1. Install MySQL Server and Workbench
2. Connect to the team database:
   - Host: 127.0.0.1
   - Port: 3306
   - Database: subsentry
   - Username: root
   - Password: password

## Run the Application

1. Clone the repository

```bash
git clone <your-repository-url>
cd javaminiproject
```

2. Build and run

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

3. Verify it's working

- Open http://localhost:8080 in your browser
- Try logging in with the test account:
  - Email: test@example.com
  - Password: password123

## Troubleshooting

- If database connection fails, ensure:
  - You can ping 127.0.0.1
  - MySQL port 3306 is accessible
  - The credentials are correct
- For any issues, check application logs in the terminal
