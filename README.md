# GKE Deployment Demo Application

This repository contains a simple web application designed to clearly demonstrate successful deployment to Google Kubernetes Engine (GKE) using Jenkins CI/CD pipelines.

## Application Overview

- Simple Express.js web server with visual deployment confirmation
- Clear UI indicating successful deployment status
- Shows Kubernetes environment information (pod name, namespace, etc.)
- Includes health check endpoints for Kubernetes probes

## Repository Structure

```
gke-demo-app/
├── server.js                    # Express application
├── package.json                 # Node.js dependencies
├── Dockerfile                   # Container build instructions
├── kubernetes-deployment.yaml   # Kubernetes manifests
├── Jenkinsfile                  # Build pipeline
├── Jenkinsfile.deploy           # Deployment pipeline
├── README.md                    # This documentation
└── public/                      # Static web assets
    ├── index.html              # Main HTML page
    ├── styles.css              # CSS styling
    └── script.js               # Client-side JavaScript
```

## CI/CD Pipeline

The CI/CD process is split into two Jenkins pipelines:

1. **Build Pipeline** (Jenkinsfile)
   - Installs dependencies
   - Runs tests
   - Builds Docker image
   - Pushes to Google Container Registry
   - Triggers the deployment pipeline

2. **Deploy Pipeline** (Jenkinsfile.deploy)
   - Takes an image tag parameter
   - Updates Kubernetes manifests
   - Applies changes to GKE cluster
   - Verifies successful deployment
   - Reports the application URL

## Setup Instructions

1. **Prerequisites**:
   - Google Cloud Platform account with GKE cluster
   - Jenkins server with access to your GCP project
   - GitHub account

2. **Setup Jenkins**:
   - Install required plugins:
     - Kubernetes plugin
     - Docker plugin
     - Pipeline plugin
   - Configure two pipeline jobs:
     - `build-pipeline`: Using the Jenkinsfile
     - `deploy-to-gke`: Using the Jenkinsfile.deploy
   - Set up GCP credentials in Jenkins with ID 'gcp-key'

3. **Update Configuration**:
   - In both Jenkinsfiles, update:
     - `your-project-id` with your GCP project ID
     - `your-gke-cluster` with your GKE cluster name
     - `CLUSTER_ZONE` if your cluster is in a different zone

4. **GitHub Setup**:
   - Push this code to your GitHub repository
   - Configure webhook to trigger Jenkins build on code push

## Local Development

```bash
# Install dependencies
npm install

# Start the application locally
npm start

# Access at http://localhost:3000
```

## What to Expect

After successful deployment:
1. Access the application via the LoadBalancer IP
2. You'll see a success page with:
   - "GKE Deployment Success!" header
   - Green checkmark indicator
   - Deployment information (pod details, timestamp, etc.)
   - "Deployed via Jenkins Pipeline" footer