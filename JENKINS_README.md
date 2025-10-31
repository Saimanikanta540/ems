# 🚀 EMS Jenkins CI/CD Setup

Complete Jenkins pipeline for building, testing, and deploying the EMS (Enterprise Management System) application.

## 📋 Prerequisites

Before setting up Jenkins, ensure you have:

- **Jenkins** installed and running on port 8080
- **Java 21** installed
- **Maven** installed
- **Node.js & npm** installed
- **MySQL** running on localhost:3306
- **Tomcat 9** installed at `/home/karthik/tomcat9`
- **Git** for repository access

## 🛠️ Quick Setup

### 1. Run the Setup Script

```bash
chmod +x jenkins-setup.sh
./jenkins-setup.sh
```

This script will:
- ✅ Check all dependencies
- ✅ Set up Jenkins credentials
- ✅ Create the database
- ✅ Create the Jenkins pipeline job

### 2. Configure Jenkins Credentials

In Jenkins web interface (`http://localhost:8080`):

1. Go to **Manage Jenkins → Manage Credentials**
2. Add new credentials:
   - **Type**: Username with password
   - **ID**: `tomcat-credentials`
   - **Username**: `admin` (Tomcat manager username)
   - **Password**: Your Tomcat manager password

### 3. Update Repository URL

Edit the Jenkins job configuration:
1. Go to **EMS-Pipeline → Configure**
2. Update the GitHub repository URL in SCM section
3. Save changes

### 4. Run the Pipeline

- **Manual Build**: Click "Build Now" on the EMS-Pipeline job
- **Automatic**: Pipeline runs every 5 minutes when code changes (configurable)

## 📊 Pipeline Stages

### 1. Checkout
- Pulls latest code from GitHub
- Supports multiple branches

### 2. Setup Environment
- Verifies MySQL connection
- Creates database if needed
- Checks Tomcat status

### 3. Build Backend
- Compiles Spring Boot application
- Runs Flyway migrations
- Creates WAR file

### 4. Build Frontend
- Installs npm dependencies
- Builds React application for production

### 5. Test Backend
- Runs unit tests
- Runs integration tests
- Generates test reports and coverage

### 6. Test Frontend
- Runs frontend tests
- Generates coverage reports

### 7. Deploy to Tomcat
- Stops existing applications
- Deploys backend WAR file
- Deploys frontend build
- Verifies deployments

### 8. Post-Deployment Tests
- Tests API endpoints
- Verifies database connectivity
- Checks application health

### 9. Health Check
- Validates backend health endpoint
- Confirms frontend accessibility

## 🌐 Application URLs

After successful deployment:

- **Frontend**: `http://localhost:9090/ems-frontend/`
- **Backend API**: `http://localhost:9090/ems-backend/api/`
- **Health Check**: `http://localhost:9090/ems-backend/actuator/health`
- **Jenkins**: `http://localhost:8080/`

## 🔧 Configuration

### Environment Variables

The pipeline uses these environment variables (can be overridden):

```bash
# Database
DB_URL=jdbc:mysql://localhost:3306/ems
DB_USERNAME=root
DB_PASSWORD=asdfghjk

# Tomcat
TOMCAT_HOME=/home/karthik/tomcat9
TOMCAT_WEBAPPS=/home/karthik/tomcat9/webapps

# Application
BACKEND_WAR_NAME=ems-backend.war
FRONTEND_CONTEXT=ems-frontend
```

### Customizing the Pipeline

#### Changing Database Settings
Update the environment variables in the Jenkinsfile or create Jenkins global properties.

#### Different Tomcat Location
Modify `TOMCAT_HOME` and `TOMCAT_WEBAPPS` variables in the Jenkinsfile.

#### Different Application Names
Update `BACKEND_WAR_NAME` and `FRONTEND_CONTEXT` variables.

#### Adding More Tests
Add stages in the Jenkinsfile for additional testing (e.g., performance tests, security scans).

## 📧 Notifications

The pipeline sends email notifications on:
- ✅ **Success**: Deployment completed with application URLs
- ❌ **Failure**: Build failed with logs attached

Configure email settings in Jenkins for notifications.

## 🔍 Monitoring & Troubleshooting

### Viewing Logs
- **Jenkins Logs**: Job console output
- **Application Logs**: Tomcat logs at `/home/karthik/tomcat9/logs/`
- **Database Logs**: MySQL logs

### Common Issues

#### Pipeline Fails at Database Connection
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials
mysql -u root -p -e "SELECT 1;"
```

#### Tomcat Deployment Fails
```bash
# Check Tomcat is running
curl http://localhost:8080

# Check Tomcat manager credentials
# Verify tomcat-users.xml has correct roles
```

#### Frontend Build Fails
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force
```

### Manual Deployment

If you need to deploy manually:

```bash
# Build backend
cd backend && ./mvnw clean package -DskipTests

# Build frontend
cd ../frontend && npm run build

# Deploy to Tomcat
cp backend/target/*.war /home/karthik/tomcat9/webapps/
cp -r frontend/dist/* /home/karthik/tomcat9/webapps/ems-frontend/
```

## 🔒 Security Considerations

- Store sensitive credentials in Jenkins credentials store
- Use HTTPS in production
- Regularly update dependencies
- Monitor application logs for security issues

## 📈 Performance Optimization

The pipeline includes:
- Parallel test execution
- Incremental builds
- Artifact archiving
- Build retention policies

## 🤝 Contributing

1. Make changes to the codebase
2. Commit and push to GitHub
3. Jenkins will automatically trigger the pipeline
4. Monitor the build and fix any issues

---

**Need Help?** Check the Jenkins console output for detailed error messages and logs.
