import { ProjectOptions } from './project.service';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ServiceBusOptions {
  namespace: string;
  resourceGroup: string;
  location: string;
  sku: 'Basic' | 'Standard' | 'Premium';
  queues?: string[];
  topics?: string[];
}

export class ServiceBusService {
  async createServiceBus(projectOptions: ProjectOptions, serviceBusOptions: ServiceBusOptions): Promise<void> {
    // Generate ServiceBus Terraform configurations
    await this.generateServiceBusTerraform(projectOptions, serviceBusOptions);
    
    // Generate ServiceBus deployment scripts
    await this.generateDeploymentScripts(projectOptions, serviceBusOptions);
    
    // Generate ServiceBus configuration files
    await this.generateConfigFiles(projectOptions, serviceBusOptions);
  }

  async deployServiceBus(projectOptions: ProjectOptions, serviceBusOptions: ServiceBusOptions): Promise<void> {
    console.log(`Deploying ServiceBus namespace: ${serviceBusOptions.namespace}`);
    
    // Execute Terraform for ServiceBus
    await this.executeTerraform(projectOptions);
    
    // Configure ServiceBus entities (queues, topics)
    await this.configureServiceBusEntities(serviceBusOptions);
    
    console.log('ServiceBus deployment completed successfully!');
  }

  private async generateServiceBusTerraform(projectOptions: ProjectOptions, serviceBusOptions: ServiceBusOptions): Promise<void> {
    const terraformDir = path.join(process.cwd(), projectOptions.name, 'terraform', 'servicebus');
    await fs.ensureDir(terraformDir);

    // Generate ServiceBus main.tf
    const mainTf = this.generateServiceBusMainTerraform(projectOptions, serviceBusOptions);
    await fs.writeFile(path.join(terraformDir, 'servicebus.tf'), mainTf);

    // Generate ServiceBus variables.tf
    const variablesTf = this.generateServiceBusVariablesTerraform(serviceBusOptions);
    await fs.writeFile(path.join(terraformDir, 'servicebus-variables.tf'), variablesTf);

    // Generate ServiceBus outputs.tf
    const outputsTf = this.generateServiceBusOutputsTerraform();
    await fs.writeFile(path.join(terraformDir, 'servicebus-outputs.tf'), outputsTf);
  }

  private generateServiceBusMainTerraform(projectOptions: ProjectOptions, options: ServiceBusOptions): string {
    const queuesConfig = options.queues?.map(queue => `
resource "azurerm_servicebus_queue" "${queue.replace(/[^a-zA-Z0-9]/g, '_')}" {
  name         = "${queue}"
  namespace_id = azurerm_servicebus_namespace.main.id

  enable_partitioning = ${options.sku === 'Premium' ? 'true' : 'false'}
  max_delivery_count  = 10
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "ButtonOps"
  }
}`).join('\n') || '';

    const topicsConfig = options.topics?.map(topic => `
resource "azurerm_servicebus_topic" "${topic.replace(/[^a-zA-Z0-9]/g, '_')}" {
  name         = "${topic}"
  namespace_id = azurerm_servicebus_namespace.main.id

  enable_partitioning = ${options.sku === 'Premium' ? 'true' : 'false'}
  max_size_in_megabytes = 1024
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "ButtonOps"
  }
}

resource "azurerm_servicebus_subscription" "${topic.replace(/[^a-zA-Z0-9]/g, '_')}_subscription" {
  name               = "${topic}-subscription"
  topic_id           = azurerm_servicebus_topic.${topic.replace(/[^a-zA-Z0-9]/g, '_')}.id
  max_delivery_count = 10
}`).join('\n') || '';

    return `# ServiceBus Infrastructure for ${projectOptions.name}

# ServiceBus Namespace
resource "azurerm_servicebus_namespace" "main" {
  name                = "$\{var.project_name}-$\{var.environment}-servicebus"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.servicebus_sku
  
  ${options.sku === 'Premium' ? 'capacity = 1' : ''}

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "ButtonOps"
  }
}

# ServiceBus Authorization Rule
resource "azurerm_servicebus_namespace_authorization_rule" "main" {
  name         = "RootManageSharedAccessKey"
  namespace_id = azurerm_servicebus_namespace.main.id

  listen = true
  send   = true
  manage = true
}

${queuesConfig}

${topicsConfig}
`;
  }

  private generateServiceBusVariablesTerraform(options: ServiceBusOptions): string {
    return `variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "${options.location}"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "servicebus_sku" {
  description = "ServiceBus namespace SKU"
  type        = string
  default     = "${options.sku}"
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.servicebus_sku)
    error_message = "ServiceBus SKU must be Basic, Standard, or Premium."
  }
}
`;
  }

  private generateServiceBusOutputsTerraform(): string {
    return `output "servicebus_namespace_name" {
  description = "Name of the ServiceBus namespace"
  value       = azurerm_servicebus_namespace.main.name
}

output "servicebus_namespace_id" {
  description = "ID of the ServiceBus namespace"
  value       = azurerm_servicebus_namespace.main.id
}

output "servicebus_connection_string" {
  description = "ServiceBus connection string"
  value       = azurerm_servicebus_namespace_authorization_rule.main.primary_connection_string
  sensitive   = true
}

output "servicebus_endpoint" {
  description = "ServiceBus namespace endpoint"
  value       = "https://$\{azurerm_servicebus_namespace.main.name}.servicebus.windows.net/"
}
`;
  }

  private async generateDeploymentScripts(projectOptions: ProjectOptions, options: ServiceBusOptions): Promise<void> {
    const scriptContent = `#!/bin/bash
# ServiceBus deployment script for ${projectOptions.name}

echo "Deploying ServiceBus infrastructure..."

# Navigate to ServiceBus terraform directory
cd terraform/servicebus

echo "Initializing Terraform for ServiceBus..."
terraform init

echo "Planning ServiceBus infrastructure..."
terraform plan \
  -var="project_name=${projectOptions.name}" \
  -var="environment=${projectOptions.env}" \
  -var="resource_group_name=${projectOptions.name}-${projectOptions.env}-rg" \
  -var="servicebus_sku=${options.sku}"

echo "Applying ServiceBus infrastructure..."
terraform apply -auto-approve \
  -var="project_name=${projectOptions.name}" \
  -var="environment=${projectOptions.env}" \
  -var="resource_group_name=${projectOptions.name}-${projectOptions.env}-rg" \
  -var="servicebus_sku=${options.sku}"

echo "ServiceBus infrastructure deployed successfully!"

# Get ServiceBus connection string
CONNECTION_STRING=$(terraform output -raw servicebus_connection_string)
echo "ServiceBus connection string: $CONNECTION_STRING"

cd ../..
`;

    const scriptPath = path.join(process.cwd(), projectOptions.name, 'scripts', 'deploy-servicebus.sh');
    await fs.ensureDir(path.dirname(scriptPath));
    await fs.writeFile(scriptPath, scriptContent);
    await fs.chmod(scriptPath, '755');
  }

  private async generateConfigFiles(projectOptions: ProjectOptions, options: ServiceBusOptions): Promise<void> {
    const configDir = path.join(process.cwd(), projectOptions.name, 'config');
    await fs.ensureDir(configDir);

    const serviceBusConfig = {
      servicebus: {
        namespace: `${projectOptions.name}-${projectOptions.env}-servicebus`,
        sku: options.sku,
        location: options.location,
        queues: options.queues || [],
        topics: options.topics || [],
        connectionString: '${SERVICEBUS_CONNECTION_STRING}',
        endpoint: `https://${projectOptions.name}-${projectOptions.env}-servicebus.servicebus.windows.net/`
      }
    };

    await fs.writeFile(
      path.join(configDir, 'servicebus.json'),
      JSON.stringify(serviceBusConfig, null, 2)
    );

    // Generate environment-specific config
    const envConfig = `# ServiceBus Configuration for ${projectOptions.env}
SERVICEBUS_NAMESPACE=${projectOptions.name}-${projectOptions.env}-servicebus
SERVICEBUS_CONNECTION_STRING=\${servicebus_connection_string}
SERVICEBUS_ENDPOINT=https://${projectOptions.name}-${projectOptions.env}-servicebus.servicebus.windows.net/
`;

    await fs.writeFile(
      path.join(configDir, `servicebus.${projectOptions.env}.env`),
      envConfig
    );
  }

  private async executeTerraform(projectOptions: ProjectOptions): Promise<void> {
    // In a real implementation, this would execute terraform commands
    console.log(`Executing Terraform for ServiceBus in project: ${projectOptions.name}`);
  }

  private async configureServiceBusEntities(options: ServiceBusOptions): Promise<void> {
    if (options.queues && options.queues.length > 0) {
      console.log(`Configuring queues: ${options.queues.join(', ')}`);
    }
    
    if (options.topics && options.topics.length > 0) {
      console.log(`Configuring topics: ${options.topics.join(', ')}`);
    }
  }
} 