pipeline {
    agent any
    environment {
        PROJECT_ID = "symbolic-math-446906-f2"
        REGION = "us-central1"
        CLUSTER_NAME = "my-cluster"
        REPO_NAME = "my-docker-repo"
        IMAGE_NAME = "my-app"
        IMAGE_TAG = "${BUILD_NUMBER}"  // Using BUILD_NUMBER instead of "latest" for better tracking
        AR_REPO = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}"
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/amalzayn/simple-web-app.git'
            }
        }
        stage('Authenticate with GCP') {
    steps {
        script {
            sh 'gcloud auth activate-service-account --key-file=/Users/ftzayn/.jenkins/terraform.json'
            sh 'gcloud config set project $PROJECT_ID'
            sh 'gcloud config set compute/region $REGION'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t $AR_REPO:$IMAGE_TAG ."
                }
            }
        }
        stage('Push Image to Artifact Registry') {
            steps {
                script {
                    sh "gcloud auth configure-docker ${REGION}-docker.pkg.dev"
                    sh "docker push $AR_REPO:$IMAGE_TAG"
                    
                    // Also tag and push as latest for convenience
                    sh "docker tag $AR_REPO:$IMAGE_TAG $AR_REPO:latest"
                    sh "docker push $AR_REPO:latest"
                }
            }
        }
        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    // Replace the image reference in the deployment YAML
                    sh "sed -i 's|\\${DOCKER_REGISTRY}/demo-app:\\${IMAGE_TAG}|$AR_REPO:$IMAGE_TAG|g' kubernetes-deployment.yaml"
                }
            }
        }
        stage('Deploy to GKE') {
            steps {
                script {
                    sh "gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION"
                    sh "kubectl apply -f kubernetes-deployment.yaml"
                    
                    // Wait for deployment to complete
                    sh "kubectl rollout status deployment/demo-app --timeout=180s"
                }
            }
        }
        stage('Get Application URL') {
            steps {
                script {
                    // Get the service IP to report in the console
                    sh "echo 'Waiting for LoadBalancer to assign an external IP...'"
                    sh "kubectl get service demo-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}'"
                }
            }
        }
    }
    post {
        success {
            echo "Deployment completed successfully!"
        }
        failure {
            echo "Deployment failed!"
        }
        always {
            // Clean up local Docker images to save space
            sh "docker rmi $AR_REPO:$IMAGE_TAG || true"
            sh "docker rmi $AR_REPO:latest || true"
        }
    }
}
