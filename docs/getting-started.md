# Getting Started with ButtonOps

ButtonOps is an Internal Developer Platform that enables you to create production-ready microservices with infrastructure in minutes.

## Prerequisites

Before using ButtonOps, ensure you have the following installed:

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Azure CLI**: Install from [Azure CLI docs](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- **Terraform**: Install from [terraform.io](https://www.terraform.io/downloads.html)
- **kubectl**: Install from [Kubernetes docs](https://kubernetes.io/docs/tasks/tools/)
- **Helm**: Install from [helm.sh](https://helm.sh/docs/intro/install/)

## Installation

### Option 1: NPM (Recommended)
```bash
npm install -g @buttonops/cli
```

### Option 2: From Source
```bash
git clone https://github.com/buttonops/cli.git
cd cli
npm install
npm run build
npm link
```

## First Time Setup

1. **Initialize Azure Login**
   ```bash
   az login
   az account set --subscription "your-subscription-id"
   ```

2. **Configure ButtonOps Workspace**
   ```bash
   cht init workspace \
     --azure-subscription "your-subscription-id" \
     --azure-devops-org "your-org" \
     --terraform-backend "azurerm"
   ```

3. **Verify Installation**
   ```bash
   cht --version
   cht --help
   ```

## Creating Your First Project

### Create a REST API
```bash
cht create project \
  --type=rest-api \
  --name=my-api \
  --env=dev
```

### Create a GraphQL API
```bash
cht create project \
  --type=graphql \
  --name=user-service \
  --env=qa
```

### Create a Background Worker
```bash
cht create project \
  --type=worker \
  --name=email-processor \
  --env=prod
```

## What Gets Created

When you run `cht create project`, ButtonOps automatically generates:

### 📁 Project Structure
```
my-api/
├── src/                    # Application source code
├── tests/                  # Test files
├── deploy/
│   ├── k8s/               # Kubernetes manifests
│   └── helm/              # Helm charts
├── terraform/             # Infrastructure as code
├── scripts/               # Deployment scripts
├── .azure-pipelines/      # Azure DevOps pipelines
├── .github/workflows/     # GitHub Actions
├── Dockerfile
├── docker-compose.yml
└── buttonops.yaml         # ButtonOps configuration
```

### 🏗️ Infrastructure
- **AKS Cluster**: Managed Kubernetes cluster
- **Redis Cache**: For caching and session storage
- **Application Gateway**: Load balancer and ingress
- **Container Registry**: For Docker images
- **Key Vault**: For secrets management

### 🚀 CI/CD Pipeline
- Multi-stage deployment (build, test, deploy)
- Security scanning
- Container vulnerability checks
- Automated testing
- Blue-green deployments

### 📊 Monitoring
- Application Insights integration
- Prometheus metrics
- Grafana dashboards
- Health checks and alerts

## Common Commands

### Project Management
```bash
# List available project types
cht create project --help

# Create with minimal prompts
cht create project --type=rest-api --name=api --env=dev

# Skip infrastructure creation
cht create project --type=rest-api --name=api --no-infrastructure

# Skip pipeline creation
cht create project --type=rest-api --name=api --no-pipeline
```

### Status and Monitoring
```bash
# Show all projects status
cht status show

# Show specific project status
cht status show --project=my-api

# Show environment-specific status
cht status show --env=qa
```

### Deployment
```bash
# Deploy specific project
cht deploy project --project=my-api --env=qa

# Force deployment
cht deploy project --project=my-api --env=prod --force
```

## Environment Configuration

ButtonOps supports multiple environments with different configurations:

### Development
- Single replica
- Basic monitoring
- Local storage
- HTTP (no SSL)

### QA/Staging
- Single replica
- Enhanced monitoring
- Persistent storage
- SSL certificates

### Production
- Multiple replicas
- Full monitoring stack
- High availability storage
- SSL certificates
- Auto-scaling enabled

## Next Steps

1. **Explore the generated project structure**
2. **Customize the application code**
3. **Review and modify infrastructure settings**
4. **Set up monitoring dashboards**
5. **Configure CI/CD pipeline variables**

## Need Help?

- 📖 [CLI Reference](./cli-reference.md)
- 🏗️ [Infrastructure Guide](./infrastructure.md)
- 📋 [Templates Documentation](./templates.md)
- 🏢 [Enterprise Setup](./enterprise.md)
- 🐛 [Report Issues](https://github.com/buttonops/cli/issues)

## Video Tutorials

🎥 **Coming Soon**: Video tutorials for common workflows and advanced configurations. 