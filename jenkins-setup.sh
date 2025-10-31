#!/bin/bash

# Jenkins Setup Script for EMS Application
# This script helps configure Jenkins for the EMS CI/CD pipeline

set -e

echo "🚀 Setting up Jenkins for EMS Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Jenkins is running
check_jenkins() {
    print_status "Checking if Jenkins is running..."
    if curl -s http://localhost:8080 > /dev/null; then
        print_success "Jenkins is running"
    else
        print_error "Jenkins is not running. Please start Jenkins first."
        echo "You can start Jenkins with: sudo systemctl start jenkins"
        echo "Or run Jenkins directly: java -jar jenkins.war"
        exit 1
    fi
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    # Check Maven
    if ! command -v mvn &> /dev/null && [ ! -f "./mvnw" ]; then
        print_error "Maven not found. Please install Maven or ensure mvnw wrapper exists."
        exit 1
    fi

    # Check Node.js and npm
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi

    # Check MySQL
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL client not found. Some features may not work."
    fi

    # Check Tomcat
    if [ ! -d "/home/karthik/tomcat9" ]; then
        print_warning "Tomcat not found at /home/karthik/tomcat9. Please update TOMCAT_HOME in Jenkinsfile."
    fi

    print_success "Dependencies check completed"
}

# Create Jenkins credentials
setup_credentials() {
    print_status "Setting up Jenkins credentials..."

    echo ""
    echo "Please create the following credentials in Jenkins:"
    echo "1. Go to Jenkins Dashboard → Manage Jenkins → Manage Credentials"
    echo "2. Add new credentials:"
    echo "   - Type: Username with password"
    echo "   - ID: tomcat-credentials"
    echo "   - Username: admin (or your Tomcat manager username)"
    echo "   - Password: your Tomcat manager password"
    echo ""

    read -p "Press Enter when you've created the Tomcat credentials..."
}

# Create Jenkins job
create_job() {
    print_status "Creating Jenkins job..."

    # Check if job already exists
    if curl -s "http://localhost:8080/job/EMS-Pipeline/api/json" > /dev/null; then
        print_warning "Jenkins job 'EMS-Pipeline' already exists. Skipping creation."
        return
    fi

    # Create pipeline job using Jenkins REST API
    JENKINS_CRUMB=$(curl -s 'http://localhost:8080/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)')
    ADMIN_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo "admin")

    cat > /tmp/job_config.xml << EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <description>EMS Application CI/CD Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.92">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.11.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/your-org/ems.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

    # Create the job
    curl -s -X POST "http://localhost:8080/createItem?name=EMS-Pipeline" \
         -H "Content-Type: application/xml" \
         -H "$JENKINS_CRUMB" \
         --data-binary @/tmp/job_config.xml \
         --user "admin:$ADMIN_PASSWORD"

    if [ $? -eq 0 ]; then
        print_success "Jenkins job 'EMS-Pipeline' created successfully"
    else
        print_error "Failed to create Jenkins job"
        echo "Please create the job manually in Jenkins web interface:"
        echo "1. Go to Jenkins Dashboard → New Item"
        echo "2. Enter name: EMS-Pipeline"
        echo "3. Select: Pipeline"
        echo "4. Configure SCM with your GitHub repository"
        echo "5. Set Script Path to: Jenkinsfile"
    fi

    rm -f /tmp/job_config.xml
}

# Setup database
setup_database() {
    print_status "Setting up database..."

    # Create database if it doesn't exist
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ems;" 2>/dev/null || {
        print_warning "Could not create database automatically. Please create it manually:"
        echo "mysql -u root -p -e 'CREATE DATABASE ems;'"
        return
    }

    print_success "Database setup completed"
}

# Main setup function
main() {
    echo "=========================================="
    echo "🚀 EMS Jenkins Setup Script"
    echo "=========================================="
    echo ""

    check_jenkins
    check_dependencies
    setup_credentials
    setup_database
    create_job

    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update the GitHub repository URL in Jenkins job configuration"
    echo "2. Run the pipeline manually to test: http://localhost:8080/job/EMS-Pipeline/build"
    echo "3. Monitor builds and fix any issues"
    echo ""
    echo "Application URLs after deployment:"
    echo "- Frontend: http://localhost:8080/ems-frontend/"
    echo "- Backend API: http://localhost:8080/ems-backend/api/"
    echo "- Jenkins: http://localhost:8080/"
}

# Run main function
main "$@"
