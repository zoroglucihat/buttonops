# ButtonOps Enterprise Setup

This guide covers setting up ButtonOps for enterprise-scale deployments with multi-tenant architecture, advanced security, and compliance features.

## 🏢 Enterprise Features

### Multi-Tenant Architecture
- **Tenant Isolation**: Complete resource isolation between organizations
- **RBAC Integration**: Azure AD/Entra ID integration
- **Cost Allocation**: Per-tenant cost tracking and billing
- **Resource Quotas**: Configurable limits per tenant

### Security & Compliance
- **Zero Trust Networking**: Network policies and micro-segmentation
- **Secret Management**: Azure Key Vault integration
- **Audit Logging**: Complete audit trail for compliance
- **Vulnerability Scanning**: Automated security scanning
- **Policy Enforcement**: Azure Policy and OPA Gatekeeper

### Scalability & Performance
- **Multi-Region**: Deploy across multiple Azure regions
- **Auto-Scaling**: Intelligent scaling based on metrics
- **Load Balancing**: Global load balancing with Traffic Manager
- **CDN Integration**: Azure CDN for static content

## 🛠 Enterprise Installation

### Prerequisites

1. **Azure Setup**
   ```bash
   # Ensure you have required permissions
   az role assignment list --assignee $(az ad signed-in-user show --query objectId -o tsv)
   ```

2. **Required Azure Roles**
   - Contributor on subscription
   - User Access Administrator
   - Azure Kubernetes Service Cluster Admin
   - Application Administrator (for service principals)

3. **Create Service Principal for ButtonOps**
   ```bash
   az ad sp create-for-rbac \
     --name "ButtonOps-Enterprise" \
     --role Contributor \
     --scopes /subscriptions/{subscription-id}
   ```

### Step 1: Enterprise Workspace Initialization

```bash
# Initialize enterprise workspace
cht init workspace \
  --azure-subscription "your-subscription-id" \
  --azure-devops-org "your-org" \
  --terraform-backend "azurerm" \
  --enterprise-mode \
  --multi-tenant \
  --compliance-framework "SOC2,HIPAA,ISO27001"
```

### Step 2: Configure Enterprise Settings

Create `buttonops-enterprise.yaml`:
```yaml
enterprise:
  enabled: true
  tenants:
    - name: "development"
      subscription: "dev-subscription-id"
      regions: ["westeurope", "northeurope"]
      quotas:
        maxClusters: 10
        maxNodes: 100
        maxStorage: "1TB"
    - name: "production"
      subscription: "prod-subscription-id"
      regions: ["westeurope", "eastus2"]
      quotas:
        maxClusters: 20
        maxNodes: 500
        maxStorage: "10TB"
  
  security:
    rbac:
      provider: "azure-ad"
      groups:
        - name: "platform-admins"
          permissions: ["admin"]
        - name: "developers"
          permissions: ["create", "deploy"]
        - name: "viewers"
          permissions: ["read"]
    
    networking:
      vnet:
        addressSpace: "10.0.0.0/8"
        subnets:
          platform: "10.1.0.0/16"
          tenants: "10.2.0.0/16"
      firewall:
        enabled: true
        rules:
          - name: "allow-https"
            priority: 100
            protocol: "TCP"
            ports: [443]
          - name: "allow-ssh"
            priority: 200
            protocol: "TCP"
            ports: [22]
            sourceIPs: ["corporate-vpn-range"]
    
    compliance:
      auditLogging: true
      dataEncryption: "customer-managed-keys"
      backupRetention: "7-years"
      vulnerabilityScanning: true

  monitoring:
    prometheus:
      enabled: true
      retention: "1y"
      federation: true
    grafana:
      enabled: true
      ldapAuth: true
    applicationInsights:
      enabled: true
      sampling: 0.1
    logAnalytics:
      retention: "2y"

  backup:
    enabled: true
    schedule: "0 2 * * *"  # Daily at 2 AM
    retention: "30d"
    crossRegionReplication: true
```

### Step 3: Deploy Enterprise Infrastructure

```bash
# Deploy enterprise platform infrastructure
cht deploy enterprise \
  --config buttonops-enterprise.yaml \
  --terraform-workspace enterprise
```

This creates:
- **Central Platform Services**
  - Shared AKS clusters for platform services
  - Central monitoring and logging
  - Shared container registry
  - Platform API gateway

- **Tenant Infrastructure**
  - Isolated resource groups per tenant
  - Dedicated networking with peering
  - Tenant-specific monitoring
  - RBAC policies

- **Security Components**
  - Azure Security Center configuration
  - Key Vault per tenant
  - Network security groups
  - Azure Firewall rules

## 🔐 Security Configuration

### Azure AD Integration

```bash
# Configure Azure AD authentication
cht security configure-auth \
  --provider azure-ad \
  --tenant-id "your-tenant-id" \
  --client-id "your-app-id" \
  --redirect-url "https://buttonops.yourdomain.com/auth/callback"
```

### RBAC Policies

```yaml
# rbac-policies.yaml
rbac:
  roles:
    platform-admin:
      permissions:
        - "cluster:admin"
        - "tenant:*"
        - "billing:read"
        - "audit:read"
    
    tenant-admin:
      permissions:
        - "tenant:admin"
        - "project:*"
        - "deploy:*"
        - "monitor:read"
    
    developer:
      permissions:
        - "project:create"
        - "project:read"
        - "deploy:dev"
        - "deploy:qa"
    
    viewer:
      permissions:
        - "project:read"
        - "monitor:read"
```

### Network Policies

```yaml
# network-policies.yaml
networkPolicies:
  - name: "deny-all-ingress"
    spec:
      podSelector: {}
      policyTypes: ["Ingress"]
  
  - name: "allow-platform-services"
    spec:
      podSelector:
        matchLabels:
          app: platform-service
      ingress:
        - from:
          - namespaceSelector:
              matchLabels:
                name: platform
  
  - name: "tenant-isolation"
    spec:
      podSelector: {}
      ingress:
        - from:
          - namespaceSelector:
              matchLabels:
                tenant: "{{ .tenant }}"
```

## 📊 Enterprise Monitoring

### Grafana Dashboards

ButtonOps includes enterprise-grade dashboards:

1. **Platform Overview**
   - Cluster health across all tenants
   - Resource utilization
   - Cost breakdown by tenant
   - SLA compliance metrics

2. **Tenant Dashboard**
   - Application performance metrics
   - Deployment frequency and success rate
   - Security alerts and compliance status
   - Cost allocation and trends

3. **Security Dashboard**
   - Vulnerability scan results
   - Access patterns and anomalies
   - Compliance violations
   - Audit log analysis

### Alerting Rules

```yaml
# enterprise-alerts.yaml
alerting:
  rules:
    - name: "tenant-quota-exceeded"
      condition: "tenant_resource_usage > tenant_quota * 0.9"
      severity: "warning"
      notification: ["platform-admins", "tenant-admins"]
    
    - name: "security-violation"
      condition: "security_scan_high_severity > 0"
      severity: "critical"
      notification: ["security-team", "platform-admins"]
    
    - name: "compliance-violation"
      condition: "compliance_check_failed > 0"
      severity: "high"
      notification: ["compliance-team", "platform-admins"]
```

## 💰 Cost Management

### Cost Allocation

ButtonOps automatically tags all resources for cost tracking:

```yaml
costManagement:
  tagging:
    strategy: "hierarchical"
    tags:
      - key: "CostCenter"
        value: "{{ .tenant.costCenter }}"
      - key: "Environment"
        value: "{{ .environment }}"
      - key: "Application"
        value: "{{ .project.name }}"
      - key: "Owner"
        value: "{{ .project.owner }}"
  
  budgets:
    - name: "tenant-monthly-budget"
      amount: "{{ .tenant.budget }}"
      period: "monthly"
      alerts:
        - threshold: 80
          contacts: ["tenant-admin"]
        - threshold: 100
          contacts: ["platform-admins", "finance-team"]
  
  reporting:
    frequency: "weekly"
    recipients: ["platform-admins", "finance-team"]
    includeRecommendations: true
```

### Resource Optimization

```bash
# Generate cost optimization report
cht cost analyze \
  --tenant all \
  --period last-30-days \
  --include-recommendations

# Apply cost optimization recommendations
cht cost optimize \
  --tenant production \
  --auto-apply low-risk \
  --dry-run
```

## 🔄 Disaster Recovery

### Backup Strategy

```yaml
backupStrategy:
  etcd:
    frequency: "every-6-hours"
    retention: "30-days"
    crossRegion: true
  
  applications:
    frequency: "daily"
    retention: "90-days"
    includeSecrets: true
  
  infrastructure:
    terraformState: "versioned"
    retention: "1-year"
```

### Recovery Procedures

```bash
# Full disaster recovery
cht disaster-recovery restore \
  --tenant production \
  --backup-date "2024-01-15" \
  --target-region eastus2

# Application-specific recovery
cht restore application \
  --project product-catalog \
  --backup-id "backup-20240115-123456"
```

## 🧪 Testing Enterprise Setup

### Load Testing

```bash
# Enterprise load test
cht test load \
  --target https://api.buttonops.yourdomain.com \
  --users 10000 \
  --duration 1h \
  --ramp-up 5m
```

### Security Testing

```bash
# Security compliance scan
cht security scan \
  --type full \
  --frameworks SOC2,HIPAA,ISO27001 \
  --report-format pdf

# Penetration testing
cht security pentest \
  --target production \
  --scope external \
  --schedule monthly
```

## 📞 Enterprise Support

### Support Tiers

1. **Platinum Support**
   - 24/7 phone and email support
   - 1-hour response time for critical issues
   - Dedicated customer success manager
   - Priority feature requests

2. **Gold Support**
   - Business hours support
   - 4-hour response time
   - Email and ticket support
   - Quarterly business reviews

3. **Standard Support**
   - Community support
   - Documentation and guides
   - Email support during business hours

### Professional Services

- **Migration Services**: Help migrate from existing platforms
- **Custom Integrations**: Integrate with existing enterprise tools
- **Training Programs**: Comprehensive training for teams
- **Architecture Reviews**: Expert review of your platform design

## 🚀 Getting Started

1. **Contact Enterprise Sales**: enterprise@buttonops.dev
2. **Schedule Demo**: Book a custom demo for your organization
3. **Proof of Concept**: 30-day enterprise trial
4. **Implementation**: Guided implementation with our experts
5. **Training**: Comprehensive team training program
6. **Go Live**: Full production deployment with support

## 📋 Compliance Certifications

ButtonOps Enterprise is compliant with:
- SOC 2 Type II
- ISO 27001
- HIPAA
- PCI DSS
- GDPR
- FedRAMP (in progress)

For more information about enterprise features and pricing, contact our enterprise team at enterprise@buttonops.dev. 