pipeline {
    agent any

    environment {
        TOMCAT_WEBAPPS = "/home/karthik/tomcat9/webapps"
        TOMCAT_URL = "http://localhost:9090/manager/text"
        TOMCAT_USER = "admin"
        TOMCAT_PASS = "admin"
        BACKEND_CONTEXT = "ems-backend"
        FRONTEND_CONTEXT = "ems-frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "✅ Pulling latest code..."
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo "⚙️ Building Spring Boot..."
                dir('backend') {
                    sh '''
                        ./mvnw clean package -DskipTests
                        mv target/*.war target/ems-backend.war
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo "🌐 Building React..."
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
                echo "🚀 Deploying to Tomcat..."

                sh '''
                    # stop existing context (ignore first time error)
                    curl -s -u ${TOMCAT_USER}:${TOMCAT_PASS} "${TOMCAT_URL}/stop?path=/${BACKEND_CONTEXT}" || true
                    curl -s -u ${TOMCAT_USER}:${TOMCAT_PASS} "${TOMCAT_URL}/undeploy?path=/${BACKEND_CONTEXT}" || true
                    curl -s -u ${TOMCAT_USER}:${TOMCAT_PASS} "${TOMCAT_URL}/undeploy?path=/${FRONTEND_CONTEXT}" || true

                    # deploy backend WAR
                    cp backend/target/ems-backend.war ${TOMCAT_WEBAPPS}/ems-backend.war

                    # deploy frontend
                    rm -rf ${TOMCAT_WEBAPPS}/${FRONTEND_CONTEXT}
                    mkdir ${TOMCAT_WEBAPPS}/${FRONTEND_CONTEXT}
                    cp -r frontend/dist/* ${TOMCAT_WEBAPPS}/${FRONTEND_CONTEXT}/
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo "🩺 Checking deployment..."
                sh '''
                    sleep 15
                    curl -f http://localhost:9090/${BACKEND_CONTEXT}/actuator/health
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful!"
        }

        failure {
            echo "❌ Deployment Failed!"
        }
    }
}
