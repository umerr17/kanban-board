pipeline {
    // Tells Jenkins to run this on any available worker node
    agent any 

    // The pipeline is broken down into sequential stages
    stages {
        
        stage('Checkout Code') {
            steps {
                // Pulls the latest code from your Git repository
                checkout scm
            }
        }
        
        stage('Deploy with Docker Compose') {
            steps {
                // Jenkins will run these exact shell commands on your Arch machine
                // 1. Tear down the old containers gracefully
                sh 'docker-compose down'
                
                // 2. Build the new images and boot them in the background
                sh 'docker-compose up --build -d'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                // A simple diagnostic check to ensure they are actually running
                sh 'docker ps'
            }
        }
    }
}