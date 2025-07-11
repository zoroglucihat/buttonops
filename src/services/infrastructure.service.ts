import { ProjectOptions } from './project.service';
import * as fs from 'fs-extra';
import * as path from 'path';

export class InfrastructureService {
  async createInfrastructure(options: ProjectOptions): Promise<void> {
    // Generate Terraform configurations
    await this.generateTerraformConfig(options);
    
    // Execute Terraform commands
    await this.executeTerraform(options);
  }

  private async generateTerraformConfig(options: ProjectOptions): Promise<void> {
    const terraformDir = path.join(process.cwd(), options.name, 'terraform');
    await fs.ensureDir(terraformDir);

    // Generate main.tf
    const mainTf = this.generateMainTerraform(options);
    await fs.writeFile(path.join(terraformDir, 'main.tf'), mainTf);

    // Generate variables.tf
    const variablesTf = this.generateVariablesTerraform(options);
    await fs.writeFile(path.join(terraformDir, 'variables.tf'), variablesTf);

    // Generate outputs.tf
    const outputsTf = this.generateOutputsTerraform(options);
    await fs.writeFile(path.join(terraformDir, 'outputs.tf'), outputsTf);
  }

  private generateMainTerraform(options: ProjectOptions): string {
    return `# ButtonOps Infrastructure for ${options.name}
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "buttonops-tfstate-rg"
    storage_account_name = "buttonopstfstate"
    container_name       = "tfstate"
    key                  = "${options.name}-${options.env}.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "$\{var.project_name}-$\{var.environment}-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "ButtonOps"
  }
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "main" {
  name                = "$\{var.project_name}-$\{var.environment}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "$\{var.project_name}-$\{var.environment}"

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = var.vm_size
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "ButtonOps"
  }
}

# Redis Cache
resource "azurerm_redis_cache" "main" {
  name                = "$\{var.project_name}-$\{var.environment}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 0
  family              = "C"
  sku_name            = "Basic"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "ButtonOps"
  }
}

# Application Gateway
resource "azurerm_virtual_network" "main" {
  name                = "$\{var.project_name}-$\{var.environment}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_subnet" "gateway" {
  name                 = "gateway-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "gateway" {
  name                = "$\{var.project_name}-$\{var.environment}-gateway-pip"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_application_gateway" "main" {
  name                = "$\{var.project_name}-$\{var.environment}-appgw"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = 2
  }

  gateway_ip_configuration {
    name      = "gateway-ip-configuration"
    subnet_id = azurerm_subnet.gateway.id
  }

  frontend_port {
    name = "frontend-port"
    port = 80
  }

  frontend_ip_configuration {
    name                 = "frontend-ip-configuration"
    public_ip_address_id = azurerm_public_ip.gateway.id
  }

  backend_address_pool {
    name = "backend-pool"
  }

  backend_http_settings {
    name                  = "backend-http-settings"
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 60
  }

  http_listener {
    name                           = "http-listener"
    frontend_ip_configuration_name = "frontend-ip-configuration"
    frontend_port_name             = "frontend-port"
    protocol                       = "Http"
  }

  request_routing_rule {
    name                       = "routing-rule"
    rule_type                  = "Basic"
    http_listener_name         = "http-listener"
    backend_address_pool_name  = "backend-pool"
    backend_http_settings_name = "backend-http-settings"
    priority                   = 100
  }
}
`;
  }

  private generateVariablesTerraform(options: ProjectOptions): string {
    return `variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "${options.name}"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "${options.env}"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "West Europe"
}

variable "node_count" {
  description = "Number of nodes in AKS cluster"
  type        = number
  default     = 2
}

variable "vm_size" {
  description = "Size of the Virtual Machine"
  type        = string
  default     = "Standard_D2s_v3"
}
`;
  }

  private generateOutputsTerraform(options: ProjectOptions): string {
    return `output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.name
}

output "aks_cluster_endpoint" {
  description = "Endpoint for the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.kube_config.0.host
}

output "redis_hostname" {
  description = "Redis cache hostname"
  value       = azurerm_redis_cache.main.hostname
}

output "redis_port" {
  description = "Redis cache port"
  value       = azurerm_redis_cache.main.port
}

output "application_gateway_ip" {
  description = "Public IP of the Application Gateway"
  value       = azurerm_public_ip.gateway.ip_address
}
`;
  }

  private async executeTerraform(options: ProjectOptions): Promise<void> {
    // In a real implementation, this would execute terraform commands
    // For now, we'll just create a placeholder script
    const scriptContent = `#!/bin/bash
# Terraform execution script for ${options.name}

echo "Initializing Terraform..."
terraform init

echo "Planning infrastructure..."
terraform plan

echo "Applying infrastructure..."
terraform apply -auto-approve

echo "Infrastructure provisioned successfully!"
`;

    const scriptPath = path.join(process.cwd(), options.name, 'scripts', 'deploy-infrastructure.sh');
    await fs.writeFile(scriptPath, scriptContent);
    await fs.chmod(scriptPath, '755');
  }
} 