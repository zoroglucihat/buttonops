import { Command } from 'commander';
import { ServiceBusService, ServiceBusOptions } from '../services/servicebus.service';
import { ProjectOptions } from '../services/project.service';

const deployCommand = new Command('deploy');

deployCommand
  .description('Deploy project to specified environment')
  .option('-p, --project <name>', 'Project name to deploy')
  .option('-e, --env <environment>', 'Target environment', 'dev')
  .option('--force', 'Force deployment even if checks fail')
  .option('--servicebus', 'Include ServiceBus deployment')
  .option('--servicebus-sku <sku>', 'ServiceBus SKU (Basic, Standard, Premium)', 'Standard')
  .option('--servicebus-queues <queues>', 'Comma-separated list of ServiceBus queues to create')
  .option('--servicebus-topics <topics>', 'Comma-separated list of ServiceBus topics to create')
  .option('--servicebus-location <location>', 'Azure region for ServiceBus', 'West Europe')
  .action(async (options) => {
    try {
      console.log('🚀 Starting deployment...');
      console.log(`Project: ${options.project}`);
      console.log(`Environment: ${options.env}`);
      
      if (options.servicebus) {
        console.log('📨 ServiceBus deployment enabled');
        await deployServiceBus(options);
      }
      
      console.log('✅ Deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    }
  });

async function deployServiceBus(options: any): Promise<void> {
  const serviceBusService = new ServiceBusService();
  
  // Parse queues and topics from comma-separated strings
  const queues = options.servicebusQueues ? 
    options.servicebusQueues.split(',').map((q: string) => q.trim()) : 
    ['orders', 'notifications'];
  
  const topics = options.servicebusTopics ? 
    options.servicebusTopics.split(',').map((t: string) => t.trim()) : 
    ['events', 'updates'];

  const projectOptions: ProjectOptions = {
    name: options.project,
    type: 'web-api',
    env: options.env,
    infrastructure: true,
    pipeline: true
  };

  const serviceBusOptions: ServiceBusOptions = {
    namespace: `${options.project}-${options.env}-servicebus`,
    resourceGroup: `${options.project}-${options.env}-rg`,
    location: options.servicebusLocation,
    sku: options.servicebussku as 'Basic' | 'Standard' | 'Premium',
    queues: queues,
    topics: topics
  };

  console.log(`📨 Deploying ServiceBus namespace: ${serviceBusOptions.namespace}`);
  console.log(`   SKU: ${serviceBusOptions.sku}`);
  console.log(`   Location: ${serviceBusOptions.location}`);
  console.log(`   Queues: ${queues.join(', ')}`);
  console.log(`   Topics: ${topics.join(', ')}`);

  await serviceBusService.deployServiceBus(projectOptions, serviceBusOptions);
}

export { deployCommand as DeployCommand }; 