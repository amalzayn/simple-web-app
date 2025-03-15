pipeline {
    agent any
    environment {
        PROJECT_ID = "symbolic-math-446906-f2"
        REGION = "us-central1"
        CLUSTER_NAME = "my-cluster"
        REPO_NAME = "my-docker-repo"
        IMAGE_NAME = "my-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        AR_REPO = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}"
        GCLOUD_PATH = "/opt/homebrew/bin/gcloud"
        DOCKER_PATH = "/opt/homebrew/bin/docker"  // Update this if your docker path is different
        KUBECTL_PATH = "/opt/homebrew/bin/kubectl"  // Update this if your kubectl path is different
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
                    sh "${GCLOUD_PATH} auth activate-service-account --key-file=/Users/ftzayn/.jenkins/terraformkey.json"
                    sh "${GCLOUD_PATH} config set project $PROJECT_ID"
                    sh "${GCLOUD_PATH} config set compute/region $REGION"
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    sh "${DOCKER_PATH} build -t $AR_REPO:$IMAGE_TAG ."
                }
            }
        }
        stage('Push Image to Artifact Registry') {
            steps {
                script {
                    sh "${GCLOUD_PATH} auth configure-docker ${REGION}-docker.pkg.dev"
                    sh "${DOCKER_PATH} push $AR_REPO:$IMAGE_TAG"
                    
                    // Also tag and push as latest for convenience
                    sh "${DOCKER_PATH} tag $AR_REPO:$IMAGE_TAG $AR_REPO:latest"
                    sh "${DOCKER_PATH} push $AR_REPO:latest"
                }
            }
        }
        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    // Replace the image reference in the deployment YAML
                    sh "sed -i '' 's|\\${DOCKER_REGISTRY}/demo-app:\\${IMAGE_TAG}|$AR_REPO:$IMAGE_TAG|g' kubernetes-deployment.yaml"
                }
            }
        }
        stage('Deploy to GKE') {
            steps {
                script {
                    sh "${GCLOUD_PATH} container clusters get-credentials $CLUSTER_NAME --region $REGION"
                    sh "${KUBECTL_PATH} apply -f kubernetes-deployment.yaml"
                    
                    // Wait for deployment to complete
                    sh "${KUBECTL_PATH} rollout status deployment/demo-app --timeout=180s"
                }
            }
        }
        stage('Get Application URL') {
            steps {
                script {
                    // Get the service IP to report in the console
                    sh "echo 'Waiting for LoadBalancer to assign an external IP...'"
                    sh "${KUBECTL_PATH} get service demo-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}'"
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
            sh "${DOCKER_PATH} rmi $AR_REPO:$IMAGE_TAG || true"
            sh "${DOCKER_PATH} rmi $AR_REPO:latest || true"
        }
    }
}
