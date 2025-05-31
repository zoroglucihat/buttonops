# ButtonOps Demo - Creating a REST API Microservice

This demo shows how to create a production-ready REST API microservice with ButtonOps in just a few commands.

## 🎯 What We'll Build

A complete REST API microservice with:
- Node.js Express server with TypeScript
- AKS Kubernetes cluster
- Redis cache
- Application Gateway (Ingress)
- CI/CD pipelines (Azure DevOps + GitHub Actions)
- Monitoring and health checks
- Auto-scaling and high availability

## 📋 Prerequisites

- Azure subscription with necessary permissions
- Azure CLI logged in
- Node.js 18+
- Terraform installed

## 🚀 Step-by-Step Demo

### Step 1: Install ButtonOps CLI
```bash
npm install -g @buttonops/cli
```

### Step 2: Initialize ButtonOps Workspace
```bash
# Configure your Azure environment
cht init workspace \
  --azure-subscription "12345678-1234-1234-1234-123456789012" \
  --azure-devops-org "mycompany" \
  --terraform-backend "azurerm"
```

### Step 3: Create Your First Microservice
```bash
# Create a REST API for a product catalog
cht create project \
  --type=rest-api \
  --name=product-catalog \
  --env=qa
```

**What happens next:**
1. ✅ **Project Structure Created** - Complete Node.js TypeScript project
2. ✅ **Infrastructure Provisioned** - AKS cluster, Redis, Application Gateway
3. ✅ **Pipeline Generated** - Azure DevOps pipeline with multi-stage deployment
4. ✅ **Monitoring Setup** - Health checks, metrics, and alerting

### Step 4: Explore the Generated Project
```bash
cd product-catalog
tree -a
```

**Project Structure:**
```
product-catalog/
├── src/
│   ├── app.ts                 # Express server setup
│   ├── routes/
│   │   └── health.ts          # Health check endpoints
│   └── middleware/
│       └── cors.ts            # CORS configuration
├── tests/                     # Test files
├── deploy/
│   ├── k8s/                   # Kubernetes manifests
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── helm/                  # Helm charts
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-qa.yaml
│       └── templates/
├── terraform/                 # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── scripts/
│   ├── deploy.sh              # Deployment script
│   └── deploy-infrastructure.sh
├── .azure-pipelines/
│   └── azure-pipelines.yml    # Azure DevOps pipeline
├── .github/workflows/
│   └── ci-cd.yml              # GitHub Actions workflow
├── Dockerfile
├── docker-compose.yml
├── buttonops.yaml             # ButtonOps configuration
└── README.md
```

### Step 5: Test Locally
```bash
# Install dependencies and run locally
npm install
npm run dev

# Test the API
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "service": "product-catalog",
  "version": "1.0.0"
}
```

### Step 6: Deploy to Azure
```bash
# Deploy infrastructure and application
./scripts/deploy.sh
```

**Deployment Process:**
1. 🏗️ **Terraform Apply** - Provisions Azure resources
2. 🐳 **Docker Build** - Builds and pushes container image
3. ⚙️ **Helm Deploy** - Deploys to Kubernetes
4. ✅ **Health Check** - Verifies deployment success

### Step 7: Verify Deployment
```bash
# Check deployment status
cht status show --project=product-catalog --env=qa

# Get service URL
kubectl get ingress -n product-catalog-qa
```

**Test the deployed API:**
```bash
curl https://product-catalog-qa.buttonops.dev/health
```

### Step 8: Monitor Your Service
```bash
# View logs
kubectl logs -f deployment/product-catalog -n product-catalog-qa

# Check metrics
kubectl top pods -n product-catalog-qa

# View Azure Application Insights (if configured)
az monitor app-insights component show \
  --resource-group product-catalog-qa-rg \
  --app product-catalog-qa-insights
```

## 📊 What You Get

### Infrastructure (Created via Terraform)
- **Resource Group**: `product-catalog-qa-rg`
- **AKS Cluster**: `product-catalog-qa-aks`
- **Redis Cache**: `product-catalog-qa-redis`
- **Application Gateway**: `product-catalog-qa-appgw`
- **Public IP**: For external access
- **Virtual Network**: Secure networking

### Application Features
- **Health Endpoints**: `/health` and `/health/ready`
- **CORS Configuration**: Production-ready CORS setup
- **Security Headers**: Helmet.js security middleware
- **Error Handling**: Centralized error handling
- **Logging**: Structured logging with Winston
- **Environment Variables**: Configuration management

### CI/CD Pipeline Features
- **Multi-Stage Pipeline**: Build → Test → Deploy
- **Container Registry**: Automatic image builds
- **Security Scanning**: Container vulnerability checks
- **Automated Testing**: Unit and integration tests
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Capability**: Quick rollback on failures

### Monitoring & Observability
- **Kubernetes Health Checks**: Liveness and readiness probes
- **Prometheus Metrics**: Application and infrastructure metrics
- **Application Insights**: Azure-native monitoring
- **Log Aggregation**: Centralized log collection
- **Alerting**: Automated alert rules

## 🎉 Success!

You now have a production-ready microservice running on Azure with:
- ✅ High availability and auto-scaling
- ✅ Automated CI/CD pipeline
- ✅ Comprehensive monitoring
- ✅ Security best practices
- ✅ Infrastructure as Code

## 🔄 Next Steps

1. **Add Business Logic**: Implement your actual API endpoints
2. **Database Integration**: Add database connections
3. **Authentication**: Implement JWT or OAuth
4. **API Documentation**: Add OpenAPI/Swagger specs
5. **Load Testing**: Test with realistic traffic
6. **Production Deployment**: Deploy to prod environment

## 💡 Pro Tips

- Use `--dry-run` to see what would be created without actually doing it
- Create multiple environments: `dev`, `qa`, `staging`, `prod`
- Customize Helm values for environment-specific configurations
- Use Azure Key Vault for sensitive configuration
- Set up monitoring dashboards in Grafana or Azure Monitor

## 🆘 Troubleshooting

Common issues and solutions:

### Pipeline Fails
```bash
# Check pipeline logs
cht status show --project=product-catalog

# Manual deployment
./scripts/deploy.sh
```

### Infrastructure Issues
```bash
# Check Terraform state
cd terraform
terraform plan
terraform apply
```

### Application Issues
```bash
# Check pod logs
kubectl logs -f deployment/product-catalog -n product-catalog-qa

# Check pod status
kubectl get pods -n product-catalog-qa
kubectl describe pod <pod-name> -n product-catalog-qa
```

This demo showcases the power of ButtonOps - from zero to production-ready microservice in minutes! 🚀 