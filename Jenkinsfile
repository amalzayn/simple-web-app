pipeline {
    agent any
    
    environment {
        // GCP Project Configuration
        PROJECT_ID = 'symbolic-math-446906-f2'
        CLUSTER_NAME = 'symbolic-math-cluster'
        CLUSTER_ZONE = 'us-central1-a'
        
        // Docker Image Configuration
        GCR_REGISTRY = "gcr.io/${PROJECT_ID}"
        IMAGE_NAME = 'simple-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        FULL_IMAGE_NAME = "${GCR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        
        // GCP Authentication
        GCP_KEY_FILE = credentials('gcp-service-account-key')
        
        // Kubernetes Manifests Path
        K8S_DIR = 'kubernetes'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup GCloud') {
            steps {
                sh '''
                    # Ensure gcloud is installed
                    if ! command -v gcloud &> /dev/null; then
                        echo "Installing Google Cloud SDK..."
                        # For macOS - adjust if using a different OS
                        curl https://sdk.cloud.google.com | bash
                        exec -l $SHELL
                    fi
                    
                    # Activate service account
                    gcloud auth activate-service-account --key-file=${GCP_KEY_FILE}
                    gcloud config set project ${PROJECT_ID}
                '''
            }
        }
        
        stage('Build with Cloud Build') {
            steps {
                sh '''
                    echo "Building Docker image with Cloud Build..."
                    gcloud builds submit --tag=${FULL_IMAGE_NAME} \
                      --service-account=projects/symbolic-math-446906-f2/serviceAccounts/terraform-sa@symbolic-math-446906-f2.iam.gserviceaccount.com .
                '''
            }
        }
        
        stage('Deploy to GKE') {
            steps {
                sh '''
                    echo "Connecting to GKE cluster..."
                    gcloud container clusters get-credentials ${CLUSTER_NAME} --zone ${CLUSTER_ZONE} --project ${PROJECT_ID}
                    
                    echo "Checking if kubernetes directory exists..."
                    if [ ! -d "${K8S_DIR}" ]; then
                        echo "Creating kubernetes directory and manifests..."
                        mkdir -p ${K8S_DIR}
                        
                        # Create deployment.yaml
                        cat > ${K8S_DIR}/deployment.yaml << EOL
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${IMAGE_NAME}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${IMAGE_NAME}
  template:
    metadata:
      labels:
        app: ${IMAGE_NAME}
    spec:
      containers:
      - name: ${IMAGE_NAME}
        image: ${FULL_IMAGE_NAME}
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
EOL
                        
                        # Create service.yaml
                        cat > ${K8S_DIR}/service.yaml << EOL
apiVersion: v1
kind: Service
metadata:
  name: ${IMAGE_NAME}-service
spec:
  selector:
    app: ${IMAGE_NAME}
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
EOL
                    else
                        echo "Kubernetes manifests directory exists, updating deployment image..."
                        # Update image in deployment.yaml if it exists
                        if [ -f "${K8S_DIR}/deployment.yaml" ]; then
                            sed -i.bak "s|image: ${GCR_REGISTRY}/${IMAGE_NAME}:.*|image: ${FULL_IMAGE_NAME}|" ${K8S_DIR}/deployment.yaml
                        fi
                    fi
                    
                    echo "Applying Kubernetes manifests..."
                    kubectl apply -f ${K8S_DIR}/
                    
                    echo "Waiting for deployment to complete..."
                    kubectl rollout status deployment/${IMAGE_NAME}
                '''
            }
        }
    }
    
    post {
        success {
            sh '''
                echo "Deployment successful! Your application is available at:"
                kubectl get service ${IMAGE_NAME}-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
            '''
        }
        failure {
            echo "Deployment failed. Please check the logs for more information."
        }
        always {
            echo "Pipeline execution completed."
        }
    }
}
