pipeline {
    agent any

    environment {
        TOMCAT_WEBAPPS = '/home/karthik/tomcat9/webapps'
        TOMCAT_MANAGER_URL = 'http://localhost:9090/manager/text'
        TOMCAT_USER = 'admin'
        TOMCAT_PASS = 'admin'
        BACKEND_WAR = 'ems-backend.war'
        FRONTEND_DIR = 'ems-frontend'
    }

    stages {
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Deploy to Tomcat') {
            steps {
                sh '''
                    # Stop old versions
                    curl -s -u ${TOMCAT_USER}:${TOMCAT_PASS} "${TOMCAT_MANAGER_URL}/stop?path=/ems-backend" || true
                    curl -s -u ${TOMCAT_USER}:${TOMCAT_PASS} "${TOMCAT_MANAGER_URL}/undeploy?path=/ems-backend" || true
                    curl -s -u ${TOMCAT_USER}:${TOMCAT_PASS} "${TOMCAT_MANAGER_URL}/undeploy?path=/ems-frontend" || true

                    # Deploy backend
                    cp backend/target/*.war ${TOMCAT_WEBAPPS}/${BACKEND_WAR}

                    # Deploy frontend
                    rm -rf ${TOMCAT_WEBAPPS}/${FRONTEND_DIR}
                    mkdir ${TOMCAT_WEBAPPS}/${FRONTEND_DIR}
                    cp -r frontend/dist/* ${TOMCAT_WEBAPPS}/${FRONTEND_DIR}/
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    sleep 15
                    curl -f http://localhost:9090/ems-backend/actuator/health || exit 1
                '''
            }
        }
    }

    post {
        success { echo "✅ EMS Deployed Successfully!" }
        failure { echo "❌ Deployment Failed!" }
    }
}
