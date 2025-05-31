"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineService = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class PipelineService {
    async createPipeline(options) {
        // Generate Azure DevOps pipeline YAML
        await this.generateAzureDevOpsPipeline(options);
        // Generate GitHub Actions workflow (alternative)
        await this.generateGitHubActions(options);
        // Generate deployment scripts
        await this.generateDeploymentScripts(options);
    }
    async generateAzureDevOpsPipeline(options) {
        const pipelineYaml = `# Azure DevOps Pipeline for ${options.name}
trigger:
  branches:
    include:
    - main
    - develop
  paths:
    exclude:
    - README.md
    - docs/*

variables:
  vmImageName: 'ubuntu-latest'
  projectName: '${options.name}'
  environment: '${options.env}'

stages:
- stage: Build
  displayName: 'Build stage'
  jobs:
  - job: Build
    displayName: 'Build'
    pool:
      vmImage: $(vmImageName)
    steps:
    - task: Docker@2
      displayName: 'Build and push Docker image'
      inputs:
        command: 'buildAndPush'
        repository: '$(projectName)'
        dockerfile: '**/Dockerfile'
        containerRegistry: 'buttonops-acr'
        tags: |
          $(Build.BuildId)
          latest

    - task: HelmDeploy@0
      displayName: 'Package Helm chart'
      inputs:
        command: 'package'
        chartPath: 'deploy/helm'
        chartVersion: '$(Build.BuildId)'

    - task: PublishBuildArtifacts@1
      displayName: 'Publish artifacts'
      inputs:
        pathToPublish: '$(Build.ArtifactStagingDirectory)'
        artifactName: 'drop'

- stage: Deploy
  displayName: 'Deploy stage'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: Deploy
    displayName: 'Deploy to $(environment)'
    pool:
      vmImage: $(vmImageName)
    environment: '$(environment)'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: KubernetesManifest@0
            displayName: 'Deploy to Kubernetes'
            inputs:
              action: 'deploy'
              kubernetesServiceConnection: 'aks-$(environment)'
              namespace: '$(projectName)-$(environment)'
              manifests: |
                deploy/k8s/*.yaml

          - task: HelmDeploy@0
            displayName: 'Deploy Helm chart'
            inputs:
              command: 'upgrade'
              chartType: 'FilePath'
              chartPath: 'deploy/helm'
              releaseName: '$(projectName)'
              namespace: '$(projectName)-$(environment)'
              valueFile: 'deploy/helm/values-$(environment).yaml'

- stage: Test
  displayName: 'Integration Tests'
  dependsOn: Deploy
  condition: succeeded()
  jobs:
  - job: Test
    displayName: 'Run integration tests'
    pool:
      vmImage: $(vmImageName)
    steps:
    - script: |
        echo "Running integration tests..."
        # Add your integration test commands here
      displayName: 'Integration tests'
`;
        const pipelineDir = path.join(process.cwd(), options.name, '.azure-pipelines');
        await fs.ensureDir(pipelineDir);
        await fs.writeFile(path.join(pipelineDir, 'azure-pipelines.yml'), pipelineYaml);
    }
    async generateGitHubActions(options) {
        const workflowYaml = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  PROJECT_NAME: ${options.name}
  ENVIRONMENT: ${options.env}

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Azure Container Registry
      uses: azure/docker-login@v1
      with:
        login-server: buttonops.azurecr.io
        username: \${{ secrets.ACR_USERNAME }}
        password: \${{ secrets.ACR_PASSWORD }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          buttonops.azurecr.io/\${{ env.PROJECT_NAME }}:\${{ github.sha }}
          buttonops.azurecr.io/\${{ env.PROJECT_NAME }}:latest
    
    - name: Setup Helm
      uses: azure/setup-helm@v3
      with:
        version: '3.10.0'
    
    - name: Package Helm chart
      run: |
        helm package deploy/helm --version \${{ github.sha }}
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: helm-chart
        path: "*.tgz"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download artifacts
      uses: actions/download-artifact@v3
      with:
        name: helm-chart
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: \${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Set up kubelogin for non-interactive login
      uses: azure/use-kubelogin@v1
      with:
        kubelogin-version: 'v0.0.25'
    
    - name: Get AKS credentials
      run: |
        az aks get-credentials --resource-group \${{ env.PROJECT_NAME }}-\${{ env.ENVIRONMENT }}-rg --name \${{ env.PROJECT_NAME }}-\${{ env.ENVIRONMENT }}-aks
    
    - name: Deploy to AKS
      run: |
        kubectl create namespace \${{ env.PROJECT_NAME }}-\${{ env.ENVIRONMENT }} --dry-run=client -o yaml | kubectl apply -f -
        helm upgrade --install \${{ env.PROJECT_NAME }} *.tgz \\
          --namespace \${{ env.PROJECT_NAME }}-\${{ env.ENVIRONMENT }} \\
          --values deploy/helm/values-\${{ env.ENVIRONMENT }}.yaml \\
          --wait --timeout=300s
`;
        const workflowDir = path.join(process.cwd(), options.name, '.github', 'workflows');
        await fs.ensureDir(workflowDir);
        await fs.writeFile(path.join(workflowDir, 'ci-cd.yml'), workflowYaml);
    }
    async generateDeploymentScripts(options) {
        const deployScript = `#!/bin/bash
# Deployment script for ${options.name}

set -e

PROJECT_NAME="${options.name}"
ENVIRONMENT="${options.env}"
NAMESPACE="$PROJECT_NAME-$ENVIRONMENT"

echo "Deploying $PROJECT_NAME to $ENVIRONMENT environment..."

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f deploy/k8s/ -n $NAMESPACE

# Deploy using Helm
echo "Deploying Helm chart..."
helm upgrade --install $PROJECT_NAME deploy/helm/ \\
  --namespace $NAMESPACE \\
  --values deploy/helm/values-$ENVIRONMENT.yaml \\
  --wait --timeout=300s

echo "Deployment completed successfully!"

# Show deployment status
echo "Deployment status:"
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE
`;
        const scriptsDir = path.join(process.cwd(), options.name, 'scripts');
        await fs.ensureDir(scriptsDir);
        await fs.writeFile(path.join(scriptsDir, 'deploy.sh'), deployScript);
        await fs.chmod(path.join(scriptsDir, 'deploy.sh'), '755');
    }
}
exports.PipelineService = PipelineService;
//# sourceMappingURL=pipeline.service.js.map