# ButtonOps - Internal Developer Platform

ButtonOps is an Internal Developer Platform (IDP) that enables developers to create production-ready microservices with a single command. It automatically provisions infrastructure, CI/CD pipelines, monitoring, and security configurations.

## 🚀 Features

- **One-Click Microservice Creation**: Generate complete microservices with infrastructure
- **Infrastructure as Code**: Automated AKS, Redis, Ingress provisioning via Terraform
- **CI/CD Integration**: Automatic Azure DevOps pipeline creation
- **Built-in Monitoring**: Prometheus, Grafana, and Application Insights integration
- **Secret Management**: Azure Key Vault integration
- **Multi-Environment Support**: dev, qa, staging, prod environments

## 🛠 Quick Start

```bash
# Install buttonops CLI
npm install -g @buttonops/cli

# Create a new REST API microservice
cht create project --type=rest-api --env=qa --name=my-service

# Create a GraphQL API
cht create project --type=graphql --env=dev --name=user-api

# Create a background worker
cht create project --type=worker --env=prod --name=email-processor
```

## 📋 Prerequisites

- Azure CLI installed and configured
- Terraform >= 1.0
- Node.js >= 18
- Azure DevOps organization access

## 🏗 What Gets Created

When you run `cht create project`, ButtonOps automatically generates:

1. **Repository Structure**
   - Application code with best practices
   - Dockerfile and docker-compose
   - Kubernetes manifests
   - Tests and documentation

2. **Infrastructure**
   - AKS cluster (if not exists)
   - Redis cache
   - Application Gateway/Ingress
   - Azure Container Registry

3. **CI/CD Pipeline**
   - Azure DevOps pipeline
   - Multi-stage deployment
   - Security scanning
   - Automated testing

4. **Monitoring & Observability**
   - Application Insights
   - Prometheus metrics
   - Grafana dashboards
   - Alerting rules

5. **Security**
   - Azure Key Vault secrets
   - Pod security policies
   - Network policies

## 🎯 Value Proposition

- **Developer Productivity**: From idea to production in minutes
- **Standardization**: Consistent practices across all microservices
- **Security by Default**: Built-in security best practices
- **Cost Optimization**: Efficient resource utilization
- **Platform Engineering Showcase**: Perfect for DevEx role transitions

## 🏢 Enterprise Ready

ButtonOps is designed for enterprise adoption with:
- Multi-tenant architecture
- RBAC integration
- Compliance frameworks
- Cost management
- Audit logging

## 📚 Documentation

- [Getting Started](./docs/getting-started.md)
- [CLI Reference](./docs/cli-reference.md)
- [Infrastructure Guide](./docs/infrastructure.md)
- [Templates](./docs/templates.md)
- [Enterprise Setup](./docs/enterprise.md)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details. 