pipeline {
    agent any

    environment {
        // Database Configuration
        DB_URL = 'jdbc:mysql://localhost:3306/ems'
        DB_USERNAME = 'root'
        DB_PASSWORD = 'asdfghjk'

        // Tomcat Configuration
        TOMCAT_HOME = '/home/karthik/tomcat9'
        TOMCAT_WEBAPPS = '/home/karthik/tomcat9/webapps'
        TOMCAT_MANAGER_URL = 'http://localhost:9090/manager/text'
        TOMCAT_USERNAME = 'admin'
        TOMCAT_PASSWORD = 'admin'

        // Application Configuration
        BACKEND_WAR_NAME = 'ems-backend.war'
        FRONTEND_CONTEXT = 'ems-frontend'

        // Node.js and Maven
        NODE_HOME = '/usr/bin/node'
        NPM_HOME = '/usr/bin/npm'
        MAVEN_HOME = '/opt/maven'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling code from GitHub...'
                checkout scm
            }
        }

        stage('Setup Environment') {
            steps {
                echo 'Setting up build environment...'
                sh '''
                    # Ensure Maven is available
                    export PATH=$MAVEN_HOME/bin:$PATH

                    # Verify MySQL connection
                    mysql -u${DB_USERNAME} -p${DB_PASSWORD} -e "SELECT 1;" || exit 1

                    # Create database if it doesn't exist
                    mysql -u${DB_USERNAME} -p${DB_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ems;"

                    # Verify Tomcat is running
                    curl -s http://localhost:9090/manager/html || echo "Tomcat not running, will start it"
                '''
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Building Spring Boot Backend...'
                dir('backend') {
                    sh '''
                        # Clean and build
                        ./mvnw clean compile -DskipTests

                        # Run database migrations (if Flyway is enabled)
                        ./mvnw flyway:migrate -Dflyway.configFiles=src/main/resources/application.properties

                        # Package the application
                        ./mvnw package -DskipTests
                    '''
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'backend/target/*.war', fingerprint: true
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building React Frontend...'
                dir('frontend') {
                    sh '''
                        # Install dependencies
                        npm ci

                        # Build for production
                        npm run build
                    '''
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
                }
            }
        }

        stage('Test Backend') {
            steps {
                echo 'Running Backend Tests...'
                dir('backend') {
                    sh '''
                        # Run unit tests
                        ./mvnw test

                        # Run integration tests (if any)
                        ./mvnw verify -Dspring.profiles.active=test
                    '''
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/*.xml'
                    jacoco execPattern: 'backend/target/jacoco.exec'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                echo 'Running Frontend Tests...'
                dir('frontend') {
                    sh '''
                        # Install dependencies if needed
                        npm ci

                        # Run tests
                        npm test -- --watchAll=false --passWithNoTests
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontend/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Coverage Report'
                    ])
                }
            }
        }

        stage('Deploy to Tomcat') {
            steps {
                echo 'Deploying to Tomcat...'

                // Stop existing applications
                sh '''
                    # Stop existing applications if running
                    curl -s -u ${TOMCAT_USERNAME}:${TOMCAT_PASSWORD} "${TOMCAT_MANAGER_URL}/stop?path=/ems-backend" || true
                    curl -s -u ${TOMCAT_USERNAME}:${TOMCAT_PASSWORD} "${TOMCAT_MANAGER_URL}/stop?path=/ems-frontend" || true

                    # Undeploy existing applications
                    curl -s -u ${TOMCAT_USERNAME}:${TOMCAT_PASSWORD} "${TOMCAT_MANAGER_URL}/undeploy?path=/ems-backend" || true
                    curl -s -u ${TOMCAT_USERNAME}:${TOMCAT_PASSWORD} "${TOMCAT_MANAGER_URL}/undeploy?path=/ems-frontend" || true
                '''

                // Deploy Backend
                sh '''
                    # Copy backend WAR to Tomcat webapps
                    cp backend/target/*.war ${TOMCAT_WEBAPPS}/${BACKEND_WAR_NAME}

                    # Wait for deployment
                    sleep 10

                    # Verify backend deployment
                    curl -s http://localhost:9090/ems-backend/api/posts || echo "Backend deployment verification failed"
                '''

                // Deploy Frontend
                sh '''
                    # Create frontend directory in Tomcat webapps
                    rm -rf ${TOMCAT_WEBAPPS}/${FRONTEND_CONTEXT}
                    mkdir -p ${TOMCAT_WEBAPPS}/${FRONTEND_CONTEXT}

                    # Copy frontend build to Tomcat
                    cp -r frontend/dist/* ${TOMCAT_WEBAPPS}/${FRONTEND_CONTEXT}/

                    # Create ROOT context for frontend (optional - makes it available at root)
                    # cp -r frontend/dist/* ${TOMCAT_WEBAPPS}/ROOT/
                '''
            }
        }

        stage('Post-Deployment Tests') {
            steps {
                echo 'Running Post-Deployment Tests...'
                sh '''
                    # Wait for applications to fully start
                    sleep 30

                    # Test backend API
                    echo "Testing Backend API..."
                    curl -s http://localhost:9090/ems-backend/api/posts | grep -q "[]" && echo "✅ Backend API OK" || echo "❌ Backend API Failed"

                    # Test frontend
                    echo "Testing Frontend..."
                    curl -s http://localhost:9090/ems-frontend/ | grep -q "<!DOCTYPE html>" && echo "✅ Frontend OK" || echo "❌ Frontend Failed"

                    # Test database connection
                    echo "Testing Database..."
                    mysql -u${DB_USERNAME} -p${DB_PASSWORD} -e "USE ems; SHOW TABLES;" && echo "✅ Database OK" || echo "❌ Database Failed"
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo 'Performing Health Checks...'
                sh '''
                # Backend health check
                BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/ems-backend/actuator/health)
                if [ "$BACKEND_HEALTH" = "200" ]; then
                    echo "✅ Backend Health Check Passed"
                else
                    echo "❌ Backend Health Check Failed (HTTP $BACKEND_HEALTH)"
                    exit 1
                fi

                # Frontend health check
                FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/ems-frontend/)
                if [ "$FRONTEND_HEALTH" = "200" ]; then
                    echo "✅ Frontend Health Check Passed"
                else
                    echo "❌ Frontend Health Check Failed (HTTP $FRONTEND_HEALTH)"
                    exit 1
                fi
                '''
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            sh '''
                # Clean up any temporary files
                # Archive logs if needed
                echo "Pipeline completed"
            '''
        }

        success {
            echo '🎉 Pipeline completed successfully!'
            emailext (
                subject: "✅ EMS Deployment Successful",
                body: """
                🚀 EMS Application Deployment Completed Successfully!

                📊 Build Details:
                - Build: ${env.BUILD_NUMBER}
                - Branch: ${env.GIT_BRANCH}
                - Commit: ${env.GIT_COMMIT}

                🌐 Application URLs:
                - Frontend: http://localhost:9090/ems-frontend/
                - Backend API: http://localhost:9090/ems-backend/api/
                - Health Check: http://localhost:9090/ems-backend/actuator/health

                🗄️ Database: MySQL (localhost:3306/ems)
                🐱 GitHub: ${env.GIT_URL}
                """,
                to: 'dev-team@company.com',
                attachLog: false
            )
        }

        failure {
            echo '❌ Pipeline failed!'
            emailext (
                subject: "❌ EMS Deployment Failed",
                body: """
                🚨 EMS Application Deployment Failed!

                📊 Build Details:
                - Build: ${env.BUILD_NUMBER}
                - Branch: ${env.GIT_BRANCH}
                - Commit: ${env.GIT_COMMIT}

                🔍 Please check the build logs for more details.
                """,
                to: 'dev-team@company.com',
                attachLog: true
            )
        }
    }

    triggers {
        // Poll SCM every 5 minutes for changes
        pollSCM('H/5 * * * *')

        // Or use webhook trigger for immediate builds
        // githubPush()
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }
}
