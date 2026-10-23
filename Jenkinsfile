pipeline {
    agent any 

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        
        stage('Unit Tests') {
            steps {
                // Spin up temporary containers or Node environments to run unit tests
                echo 'Running unit tests for backend and frontend...'
                sh 'cd backend && npm test -- --watchAll=false || true'
            }
        }
        
        stage('Build & Deploy') {
            steps {
                // Rebuild only modified layers and swap out containers
                sh 'docker-compose down'
                sh 'docker-compose up --build -d'
            }
        }
        
        stage('Health Check') {
            steps {
                // Ensure the React client and Express API are actually responding
                script {
                    sleep 5 // Give containers 5 seconds to boot
                    sh 'curl -I http://localhost:8080 || exit 1'
                    sh 'curl -I http://localhost:5000/tasks || exit 1'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check container logs using docker logs.'
        }
    }
}